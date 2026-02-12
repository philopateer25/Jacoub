'use client';

import { PlayerProvider } from '@/components/PlayerProvider';
import GlobalPlayer from '@/components/GlobalPlayer';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    const logout = () => {
        localStorage.clear();
        router.push('/');
    };

    return (
        <PlayerProvider>
            <div className="min-h-screen bg-slate-900 text-slate-100 pb-32">
                <nav className="border-b border-slate-700 bg-slate-800 p-4 flex justify-between items-center sticky top-0 z-10">
                    <span className="font-bold text-lg">My Learning</span>
                    <button
                        onClick={logout}
                        className="text-sm hover:text-red-400 underline"
                    >
                        Logout
                    </button>
                </nav>
                {children}
                <GlobalPlayer />
            </div>
        </PlayerProvider>
    );
}
