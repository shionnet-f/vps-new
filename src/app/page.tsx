'use client';

import { Edit, Database, BarChart2, User } from 'lucide-react';
import Link from 'next/link';

const items = [
  { href: '/matches/input', icon: <Edit size={60} />, label: 'データ入力' },
  { href: '/matches', icon: <Database size={60} />, label: '試合データ' },
  { href: '/analysis', icon: <BarChart2 size={60} />, label: '分析データ' },
  { href: '/players', icon: <User size={60} />, label: '選手ページ' }
];

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="grid grid-cols-2 gap-20 p-20 bg-blue-100 rounded-xl shadow-xl">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col items-center">
            <Link href={item.href}>
              <div className="w-32 h-32 bg-[#6D28D9] text-white rounded-xl shadow-md flex items-center justify-center hover:bg-violet-700 hover:scale-105 transition-all">
                {item.icon}
              </div>
            </Link>
            <span className="mt-2 text-base text-violet-700 font-bold">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}
