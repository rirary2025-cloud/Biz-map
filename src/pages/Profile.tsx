import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { MapPin, Save, AlertCircle, CheckCircle, LogOut } from 'lucide-react';

interface Member {
  id: string;
  display_name: string;
  company_name: string;
  industry_1: string;
  industry_2: string;
  want_to_introduce: string;
  can_introduce: string;
  latitude: number;
  longitude: number;
  visible: boolean;
  general_public: boolean;
  payment_status: string;
}

export const Profile: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<Member | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadMember = async () => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        setError('プロフィールの読み込みに失敗しました');
        console.error(error);
      } else if (data) {
        setMember(data as Member);
        setFormData(data as Member);
      }
      setLoading(false);
    };

    loadMember();
  }, [user, navigate]);

  const handleSave = async () => {
    if (!formData || !member) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase
        .from('members')
        .update(formData)
        .eq('id', member.id);

      if (error) throw error;

      setMember(formData);
      setSuccess('プロフィールが更新されました');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
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

  if (!member || !formData) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-red-900 text-white p-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">マイプロフィール</h1>
            <button
              onClick={handleSignOut}
              className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded flex items-center gap-2"
            >
              <LogOut size={18} />
              ログアウト
            </button>
          </div>
        </header>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-slate-600 mb-4">プロフィールが見つかりません</p>
            <p className="text-sm text-slate-500">管理者にお問い合わせください</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-red-900 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MapPin size={28} />
            <h1 className="text-2xl font-bold">マイプロフィール</h1>
          </div>
          <button
            onClick={handleSignOut}
            className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded flex items-center gap-2 transition"
          >
            <LogOut size={18} />
            ログアウト
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">ステータス</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded">
              <p className="text-sm text-slate-600 mb-1">掲載状態</p>
              <p className="text-lg font-semibold text-slate-900">
                {formData.visible ? '掲載中' : '非掲載'}
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded">
              <p className="text-sm text-slate-600 mb-1">支払い状態</p>
              <p className="text-lg font-semibold text-slate-900">
                {formData.payment_status === 'active' ? 'アクティブ' : '非アクティブ'}
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded">
              <p className="text-sm text-slate-600 mb-1">公開範囲</p>
              <p className="text-lg font-semibold text-slate-900">
                {formData.general_public ? '一般公開' : '会員限定'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">基本情報</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                表示名
              </label>
              <input
                type="text"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                会社名
              </label>
              <input
                type="text"
                value={formData.company_name || ''}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  業種1
                </label>
                <input
                  type="text"
                  value={formData.industry_1 || ''}
                  onChange={(e) => setFormData({ ...formData, industry_1: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  業種2（任意）
                </label>
                <input
                  type="text"
                  value={formData.industry_2 || ''}
                  onChange={(e) => setFormData({ ...formData, industry_2: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                紹介してほしい内容
              </label>
              <textarea
                value={formData.want_to_introduce || ''}
                onChange={(e) => setFormData({ ...formData, want_to_introduce: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                紹介できる内容
              </label>
              <textarea
                value={formData.can_introduce || ''}
                onChange={(e) => setFormData({ ...formData, can_introduce: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <input
                type="checkbox"
                id="visible"
                checked={formData.visible}
                onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="visible" className="text-sm font-medium text-slate-900">
                マップに掲載する
              </label>
            </div>

            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <input
                type="checkbox"
                id="general"
                checked={formData.general_public}
                onChange={(e) => setFormData({ ...formData, general_public: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="general" className="text-sm font-medium text-slate-900">
                一般に公開する
              </label>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
            >
              <Save size={18} />
              {saving ? '保存中...' : '保存する'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
