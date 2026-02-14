'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const logout = () => {
        localStorage.clear();
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100">
            <nav className="border-b border-slate-700 bg-slate-800 p-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <span className="font-bold text-lg">Jacoub Admin</span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex gap-6 items-center">
                        <a href="/admin" className="text-slate-300 hover:text-white transition-colors">Dashboard</a>
                        <a href="/admin/weeks" className="text-slate-300 hover:text-white transition-colors">Weeks</a>
                        <a href="/admin/upload" className="text-slate-300 hover:text-white transition-colors">Upload</a>
                        <a href="/admin/answers" className="text-slate-300 hover:text-white transition-colors">Answers</a>
                        <a href="/admin/analytics" className="text-slate-300 hover:text-white transition-colors">Analytics</a>
                        <button onClick={logout} className="text-red-400 hover:text-red-300 underline text-sm">Logout</button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-slate-300"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? '✕' : '☰'}
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMenuOpen && (
                    <div className="md:hidden mt-4 flex flex-col gap-4 border-t border-slate-700 pt-4 pb-2 animate-fadeIn">
                        <a href="/admin" className="text-slate-300 hover:text-white block py-2" onClick={() => setIsMenuOpen(false)}>Dashboard</a>
                        <a href="/admin/weeks" className="text-slate-300 hover:text-white block py-2" onClick={() => setIsMenuOpen(false)}>Weeks</a>
                        <a href="/admin/upload" className="text-slate-300 hover:text-white block py-2" onClick={() => setIsMenuOpen(false)}>Upload</a>
                        <a href="/admin/answers" className="text-slate-300 hover:text-white block py-2" onClick={() => setIsMenuOpen(false)}>Answers</a>
                        <a href="/admin/analytics" className="text-slate-300 hover:text-white block py-2" onClick={() => setIsMenuOpen(false)}>Analytics</a>
                        <button onClick={logout} className="text-red-400 hover:text-red-300 text-left py-2">Logout</button>
                    </div>
                )}
            </nav>
            {children}
        </div>
    );
}
