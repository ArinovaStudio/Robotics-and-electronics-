'use client';
import { useAdminStore } from "@/store/adminStore";
import {
    LayoutGrid,
    ShoppingCart,
    Users,
    LayoutDashboard,
    LogOutIcon,
    Box,
    FolderTree,
    X
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/admin" },
    { name: "Orders", icon: ShoppingCart, href: "/admin/orders" },
    { name: "Products", icon: Box, href: "/admin/products" },
    { name: "Categories", icon: FolderTree, href: "/admin/categories" },
    { name: "Customers", icon: Users, href: "/admin/users" },
];

interface NavbarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export default function Navbar({ isOpen, setIsOpen }: NavbarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { logout } = useAdminStore();

    const activeItem = navItems.find(item => 
        item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
    );

    const handleLogout = async () => {
        try {
            logout();
            // call actual logout later
            router.push("/login");
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    return (
        <>
            {/* Mobile Backdrop Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed max-md:z-200 left-0 top-0 z-40 h-screen w-72 border-r bg-white shadow-sm transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="flex h-full flex-col">
                    {/* Logo Section */}
                    <div className="flex items-center justify-between px-4 py-6 border-b border-slate-50 md:border-none">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 shadow-lg shadow-orange-200">
                                <LayoutGrid className="h-7 w-15 text-white" />
                            </div>
                            <h1 className="text-lg font-bold text-slate-800 tracking-tight">Robotics and Electronics</h1>
                        </div>
                        {/* Mobile Close Button */}
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="md:hidden p-2 text-slate-400 hover:bg-slate-100 rounded-xl"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                        <ul className="space-y-2">
                            {navItems.map((item) => {
                                const isActive = activeItem?.name === item.name;

                                return (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            onClick={() => setIsOpen(false)} // Auto-close on mobile
                                            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 ${
                                                isActive
                                                    ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                                                    : "text-slate-500 hover:bg-orange-50 hover:text-orange-600"
                                            }`}
                                        >
                                            <item.icon className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-400"}`} />
                                            <span className="text-[16px] font-medium">{item.name}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Logout Button */}
                    <div className="p-4 border-t border-slate-100">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-4 px-4 py-3.5 w-full rounded-2xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                        >
                            <LogOutIcon className="h-5 w-5" />
                            <span className="text-[16px] font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}