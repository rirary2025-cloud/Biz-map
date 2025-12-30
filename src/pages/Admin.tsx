import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { BarChart3, Users, MapPin, LogOut, AlertCircle, Eye, EyeOff, Lock, Unlock, Trash2 } from 'lucide-react';

interface Member {
  id: string;
  display_name: string;
  user_id: string;
  branch_id: string;
  visible: boolean;
  payment_status: string;
  last_updated_by: string;
  updated_at: string;
}

interface Branch {
  id: string;
  name: string;
  region: string;
  member_count: number;
}

export const Admin: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'members' | 'branches'>('dashboard');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const checkAdminAccess = async () => {
      const { data, error } = await supabase
        .from('members')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error || data?.role !== 'admin') {
        setError('管理者権限がありません');
        navigate('/');
        return;
      }

      loadData();
    };

    checkAdminAccess();
  }, [user, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('*')
        .order('updated_at', { ascending: false });

      if (membersError) throw membersError;
      setMembers(membersData || []);

      const { data: branchesData, error: branchesError } = await supabase
        .from('branches')
        .select('*')
        .order('region', { ascending: true });

      if (branchesError) throw branchesError;
      setBranches(branchesData || []);
    } catch (err: any) {
      setError(err.message || 'データ読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async (memberId: string, currentVisible: boolean) => {
    try {
      const { error } = await supabase
        .from('members')
        .update({ visible: !currentVisible })
        .eq('id', memberId);

      if (error) throw error;
      loadData();
    } catch (err: any) {
      setError(err.message || '更新に失敗しました');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const activeMembersCount = members.filter(m => m.payment_status === 'active').length;
  const visibleMembersCount = members.filter(m => m.visible).length;

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
    <div className="min-h-screen bg-slate-50">
      <header className="bg-red-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 size={28} />
            管理画面
          </h1>
          <button
            onClick={handleSignOut}
            className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded flex items-center gap-2 transition"
          >
            <LogOut size={18} />
            ログアウト
          </button>
        </div>
      </header>

      {error && (
        <div className="max-w-7xl mx-auto p-6">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 flex gap-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-4 font-medium transition border-b-2 ${
              activeTab === 'dashboard'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            ダッシュボード
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`py-4 font-medium transition border-b-2 ${
              activeTab === 'members'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            会員管理
          </button>
          <button
            onClick={() => setActiveTab('branches')}
            className={`py-4 font-medium transition border-b-2 ${
              activeTab === 'branches'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            支部管理
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">総会員数</p>
                  <p className="text-4xl font-bold text-slate-900 mt-2">{members.length}</p>
                </div>
                <Users className="text-blue-600" size={40} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">掲載中</p>
                  <p className="text-4xl font-bold text-blue-600 mt-2">{visibleMembersCount}</p>
                </div>
                <Eye className="text-blue-600" size={40} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">支部数</p>
                  <p className="text-4xl font-bold text-slate-900 mt-2">{branches.length}</p>
                </div>
                <MapPin className="text-blue-600" size={40} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">名前</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">支部</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">支払い</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">表示</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">更新者</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3 text-sm text-slate-900">{member.display_name}</td>
                      <td className="px-6 py-3 text-sm text-slate-600">{member.branch_id}</td>
                      <td className="px-6 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            member.payment_status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {member.payment_status === 'active' ? 'アクティブ' : '非アクティブ'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm">
                        {member.visible ? (
                          <Eye className="text-green-600" size={18} />
                        ) : (
                          <EyeOff className="text-slate-400" size={18} />
                        )}
                      </td>
                      <td className="px-6 py-3 text-sm text-slate-600 text-xs">
                        {member.last_updated_by === 'admin' ? '管理者' : '本人'}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <button
                          onClick={() => toggleVisibility(member.id, member.visible)}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 transition"
                        >
                          {member.visible ? <EyeOff size={16} /> : <Eye size={16} />}
                          {member.visible ? '非表示' : '表示'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'branches' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {branches.map((branch) => (
              <div key={branch.id} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-2">{branch.name}</h3>
                <p className="text-sm text-slate-600 mb-4">{branch.region}</p>
                <div className="p-3 bg-slate-50 rounded">
                  <p className="text-2xl font-bold text-slate-900">{branch.member_count}</p>
                  <p className="text-xs text-slate-600">会員数</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
