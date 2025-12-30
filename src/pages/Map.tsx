import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { MapPin, LogOut, Menu, X } from 'lucide-react';

interface Branch {
  id: string;
  name: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  member_count: number;
}

interface Member {
  id: string;
  display_name: string;
  company_name: string;
  industry_1: string;
  latitude: number;
  longitude: number;
  want_to_introduce: string;
  can_introduce: string;
}

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const branchIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [35, 47],
  iconAnchor: [17, 47],
  popupAnchor: [1, -40],
  shadowSize: [50, 50],
  className: 'brightness-150',
});

export const Map: React.FC = () => {
  const { user, signOut } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [publicLevel, setPublicLevel] = useState<1 | 2 | 3>(user ? 3 : 1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const { data: branchesData, error: branchError } = await supabase
        .from('branches')
        .select('*')
        .eq('public', true);

      if (branchError) console.error('Branch error:', branchError);
      if (branchesData) setBranches(branchesData);

      if (user && publicLevel >= 2) {
        const { data: membersData, error: memberError } = await supabase
          .from('members')
          .select('*')
          .eq('visible', true)
          .gte('public_level', publicLevel);

        if (memberError) console.error('Member error:', memberError);
        if (membersData) setMembers(membersData);
      }

      setLoading(false);
    };

    loadData();
  }, [user, publicLevel]);

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-slate-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-red-900 text-white shadow-lg fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MapPin size={28} />
            <h1 className="text-2xl font-bold">守成マップ</h1>
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="hidden md:flex items-center gap-6">
            {user && (
              <>
                <span className="text-sm text-red-200">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded transition flex items-center gap-2"
                >
                  <LogOut size={18} />
                  ログアウト
                </button>
              </>
            )}
          </div>
        </div>

        {mobileMenuOpen && user && (
          <div className="md:hidden bg-red-800 px-6 py-4 border-t border-red-700">
            <p className="text-sm text-red-200 mb-4">{user.email}</p>
            <button
              onClick={handleSignOut}
              className="w-full bg-red-700 hover:bg-red-800 px-4 py-2 rounded transition flex items-center justify-center gap-2"
            >
              <LogOut size={18} />
              ログアウト
            </button>
          </div>
        )}
      </header>

      <div className="pt-20 pb-4 px-4 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-4 items-center flex-wrap">
            <span className="text-sm font-semibold text-slate-700">表示レベル:</span>
            {user ? (
              <>
                <button
                  onClick={() => setPublicLevel(2)}
                  className={`px-4 py-2 rounded text-sm transition ${
                    publicLevel === 2
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  会員限定
                </button>
                <button
                  onClick={() => setPublicLevel(3)}
                  className={`px-4 py-2 rounded text-sm transition ${
                    publicLevel === 3
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  フル情報
                </button>
              </>
            ) : (
              <span className="text-sm text-slate-600">ログインして詳細情報を表示</span>
            )}
          </div>
        </div>
      </div>

      <div className="relative w-full h-[calc(100vh-140px)]">
        <MapContainer
          center={[44.0, 141.3]}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {branches.map((branch) => (
            <Marker
              key={branch.id}
              position={[branch.latitude, branch.longitude]}
              icon={branchIcon}
            >
              <Popup>
                <div className="p-3">
                  <h3 className="font-bold text-slate-900">{branch.name}</h3>
                  <p className="text-sm text-slate-600">{branch.region} {branch.city}</p>
                  <p className="text-xs text-slate-500 mt-2">会員数: {branch.member_count}名</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {members.map((member) => (
            <Marker
              key={member.id}
              position={[member.latitude, member.longitude]}
              icon={defaultIcon}
            >
              <Popup>
                <div className="p-3 max-w-xs">
                  <h3 className="font-bold text-slate-900">{member.display_name}</h3>
                  {member.company_name && (
                    <p className="text-sm text-slate-600">{member.company_name}</p>
                  )}
                  <p className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mt-2 inline-block">
                    {member.industry_1}
                  </p>
                  {member.want_to_introduce && (
                    <p className="text-xs text-slate-600 mt-2">
                      <span className="font-semibold">依頼したい:</span> {member.want_to_introduce}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};
