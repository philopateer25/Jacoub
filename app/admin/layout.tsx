'use client';

import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    const logout = () => {
        localStorage.clear();
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100">
            <nav className="border-b border-slate-700 bg-slate-800 p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start">
                    <span className="font-bold text-lg hidden md:inline">Jacoub Admin</span>
                    <a href="/admin" className="text-slate-300 hover:text-white text-sm md:text-base">Dashboard</a>
                    <a href="/admin/weeks" className="text-slate-300 hover:text-white text-sm md:text-base">Weeks</a>
                    <a href="/admin/upload" className="text-slate-300 hover:text-white text-sm md:text-base">Upload</a>
                    <a href="/admin/answers" className="text-slate-300 hover:text-white text-sm md:text-base">Answers</a>
                    <a href="/admin/analytics" className="text-slate-300 hover:text-white text-sm md:text-base">Analytics</a>
                </div>
                <button
                    onClick={logout}
                    className="text-sm hover:text-red-400 underline"
                >
                    Logout
                </button>
            </nav>
            {children}
        </div>
    );
}
