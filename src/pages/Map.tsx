import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { MapPin, LogOut, Menu, X, Building2, Users, ChevronLeft, ChevronRight } from 'lucide-react';

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

const createColoredIcon = (color: string, size: [number, number] = [25, 41]) => {
  const svgIcon = `
    <svg width="${size[0]}" height="${size[1]}" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 8.4 12.5 28.5 12.5 28.5S25 20.9 25 12.5C25 5.6 19.4 0 12.5 0z" fill="${color}"/>
      <circle cx="12.5" cy="12.5" r="6" fill="white"/>
    </svg>
  `;
  return L.divIcon({
    html: svgIcon,
    className: 'custom-marker',
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1]],
    popupAnchor: [0, -size[1] + 10],
  });
};

const branchIcon = createColoredIcon('#dc2626', [32, 48]);
const memberIcon = createColoredIcon('#2563eb', [25, 41]);

interface MapControllerProps {
  center: [number, number];
  zoom: number;
}

const MapController: React.FC<MapControllerProps> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export const Map: React.FC = () => {
  const { user, signOut } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [publicLevel, setPublicLevel] = useState<1 | 2 | 3>(user ? 3 : 1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([43.5, 142.0]);
  const [mapZoom, setMapZoom] = useState(6);

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

  const flyToBranch = (branch: Branch) => {
    setMapCenter([branch.latitude, branch.longitude]);
    setMapZoom(10);
  };

  const flyToMember = (member: Member) => {
    setMapCenter([member.latitude, member.longitude]);
    setMapZoom(12);
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

      <div className="relative w-full h-[calc(100vh-140px)] flex">
        <div
          className={`absolute left-0 top-0 h-full bg-white shadow-lg transition-all duration-300 z-10 ${
            sidebarOpen ? 'w-80' : 'w-0'
          } overflow-hidden`}
        >
          <div className="p-4 h-full overflow-y-auto">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Building2 size={20} className="text-red-600" />
                <h2 className="font-bold text-lg text-slate-900">支部一覧</h2>
                <span className="text-sm text-slate-500">({branches.length})</span>
              </div>
              <div className="space-y-2">
                {branches.map((branch) => (
                  <button
                    key={branch.id}
                    onClick={() => flyToBranch(branch)}
                    className="w-full text-left p-3 bg-red-50 hover:bg-red-100 rounded-lg transition border border-red-200"
                  >
                    <h3 className="font-semibold text-slate-900">{branch.name}</h3>
                    <p className="text-sm text-slate-600">{branch.region} {branch.city}</p>
                    <p className="text-xs text-slate-500 mt-1">会員数: {branch.member_count}名</p>
                  </button>
                ))}
              </div>
            </div>

            {members.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users size={20} className="text-blue-600" />
                  <h2 className="font-bold text-lg text-slate-900">会員一覧</h2>
                  <span className="text-sm text-slate-500">({members.length})</span>
                </div>
                <div className="space-y-2">
                  {members.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => flyToMember(member)}
                      className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition border border-blue-200"
                    >
                      <h3 className="font-semibold text-slate-900">{member.display_name}</h3>
                      {member.company_name && (
                        <p className="text-sm text-slate-600">{member.company_name}</p>
                      )}
                      <p className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mt-1 inline-block">
                        {member.industry_1}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`absolute top-4 ${
            sidebarOpen ? 'left-80' : 'left-0'
          } z-20 bg-white shadow-lg p-2 rounded-r-lg hover:bg-slate-50 transition-all duration-300`}
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>

        <div className={`flex-1 ${sidebarOpen ? 'ml-80' : 'ml-0'} transition-all duration-300`}>
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
          >
            <MapController center={mapCenter} zoom={mapZoom} />
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
                    <h3 className="font-bold text-slate-900 mb-1">{branch.name}</h3>
                    <p className="text-sm text-slate-600">{branch.region} {branch.city}</p>
                    {branch.founded_year && (
                      <p className="text-xs text-slate-500 mt-1">設立: {branch.founded_year}年</p>
                    )}
                    <p className="text-xs text-slate-500">会員数: {branch.member_count}名</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {members.map((member) => (
              <Marker
                key={member.id}
                position={[member.latitude, member.longitude]}
                icon={memberIcon}
              >
                <Popup>
                  <div className="p-3 max-w-xs">
                    <h3 className="font-bold text-slate-900 mb-1">{member.display_name}</h3>
                    {member.company_name && (
                      <p className="text-sm text-slate-600 mb-2">{member.company_name}</p>
                    )}
                    <p className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded inline-block mb-2">
                      {member.industry_1}
                    </p>
                    {member.want_to_introduce && (
                      <div className="mt-2 pt-2 border-t border-slate-200">
                        <p className="text-xs font-semibold text-slate-700">依頼したい:</p>
                        <p className="text-xs text-slate-600">{member.want_to_introduce}</p>
                      </div>
                    )}
                    {member.can_introduce && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold text-slate-700">紹介できる:</p>
                        <p className="text-xs text-slate-600">{member.can_introduce}</p>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};
