'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/store/adminStore';
import TopBar from '@/components/admin/TopBar';
import Navbar from '@/components/admin/Navbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { isValidSession, logout } = useAdminStore();
    const [isMounted, setIsMounted] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        
        if (!isValidSession()) {
            logout();
            router.push('/login');
        }
    }, [isValidSession, logout, router]);

    if (!isMounted || !isValidSession()) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            <Navbar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            
            <main className="flex-1 md:ml-72 bg-gray-50 min-h-screen flex flex-col w-full transition-all duration-300">
                <TopBar onMenuClick={() => setIsSidebarOpen(true)} />
                
                <div className="mt-4 p-4 sm:p-6 md:px-10 flex-1 overflow-x-hidden">
                    {children}
                </div>
            </main>
        </div>
    );
}