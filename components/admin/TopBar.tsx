'use client';

import { useAdminStore } from "@/store/adminStore";
import { Menu } from "lucide-react"; 

interface TopBarProps {
    onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
    const { user } = useAdminStore();

    const initials = user?.name ? user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase(): 'AD';

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 sm:px-6 py-3 shadow-sm">
            <div className="flex items-center justify-between w-full">
                <button 
                    onClick={onMenuClick}
                    className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* Profile Section - Pushed to right */}
                <div className="flex items-center gap-4 ml-auto">
                    <button className="flex items-center gap-3 p-1 rounded-lg hover:bg-slate-50 transition-colors group">
                        {user?.image ? (
                            <img src={user.image} alt="Profile" className="w-9 h-9 rounded-full object-cover shadow-sm" />
                        ) : (
                            <div className="flex items-center justify-center text-white text-sm font-bold w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 shadow-sm shadow-orange-200">
                                {initials}
                            </div>
                        )}
                        <div className="hidden sm:block text-left">
                            <p className="text-sm font-semibold text-slate-900 leading-none">{user?.name || "Admin"}</p>
                            <p className="text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-wider">{user?.role || "Admin"}</p>
                        </div>
                    </button>
                </div>
            </div>
        </header>
    );
}