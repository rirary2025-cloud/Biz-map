import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, TrendingUp, ArrowRight } from 'lucide-react';

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-red-900 text-white">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MapPin size={28} />
            守成マップ
          </h1>
          <div className="flex gap-4">
            <Link to="/login" className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded transition">ログイン</Link>
          </div>
        </nav>
      </header>

      <section className="bg-gradient-to-br from-red-500 to-red-700 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">ビジネスマップ</h2>
          <p className="text-xl mb-8 text-red-100">全国の支部活動を"安全に"可視化</p>
          <p className="text-lg mb-12 text-red-100 max-w-2xl mx-auto">
            経営者同士の信頼と紹介文化を守りながら、ネットワークの価値を最大化します
          </p>
          <Link
            to="/map"
            className="inline-flex items-center gap-2 bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-red-50 transition"
          >
            マップを見る <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <section className="bg-slate-50 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold mb-8 text-slate-900">利用案内</h3>
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-2">会員の方</h4>
              <p className="text-slate-600 mb-4">ログインして、より詳細な会員情報を閲覧できます</p>
              <Link to="/login" className="text-red-500 hover:text-red-600 font-semibold">ログインする →</Link>
            </div>
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-2">掲載をご希望の方</h4>
              <p className="text-slate-600 mb-4">新規登録いただき、掲載申請をお願いします（月額5,000円）</p>
              <Link to="/register" className="text-red-500 hover:text-red-600 font-semibold">新規掲載する →</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-red-900 text-white py-8 px-6 text-center text-sm text-red-200">
        <p>© 2024 守成マップ（非公式）</p>
      </footer>
    </div>
  );
};
