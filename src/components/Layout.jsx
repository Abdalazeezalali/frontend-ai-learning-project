import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { cn } from "../lib/utils";
import {
    LayoutDashboard,
    FileText,
    Brain,
    GraduationCap,
    LogOut,
    Menu,
    X,
    Sparkles,
    ChevronLeft,
    User,
} from "lucide-react";
import { Button } from "./ui/Button";

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Documents", href: "/documents", icon: FileText },
    { name: "Flashcards", href: "/flashcards", icon: Brain },
    { name: "Quizzes", href: "/quizzes", icon: GraduationCap },
];

export default function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-slate-950 flex">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-800 bg-slate-900/95 backdrop-blur-xl transition-all duration-300 lg:static",
                    collapsed ? "w-20" : "w-64",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Logo area */}
                <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
                    <Link to="/dashboard" className="flex items-center gap-3 group">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        {!collapsed && (
                            <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                LearnAI
                            </span>
                        )}
                    </Link>
                    <button
                        onClick={() => {
                            setSidebarOpen(false);
                            setCollapsed(!collapsed);
                        }}
                        className="hidden lg:flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                        <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
                    </button>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-slate-400 hover:text-white cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Nav links */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive =
                            location.pathname === item.href ||
                            location.pathname.startsWith(item.href + "/");
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                                    isActive
                                        ? "bg-indigo-600/10 text-indigo-400 shadow-sm border border-indigo-500/20"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "h-5 w-5 flex-shrink-0 transition-colors",
                                        isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                                    )}
                                />
                                {!collapsed && <span>{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* User section */}
                <div className="border-t border-slate-800 p-3">
                    <div
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                            collapsed ? "justify-center" : ""
                        )}
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-bold flex-shrink-0">
                            {user?.username?.charAt(0)?.toUpperCase() || <User className="h-4 w-4" />}
                        </div>
                        {!collapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                    {user?.username || "User"}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                    {user?.email || ""}
                                </p>
                            </div>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size={collapsed ? "icon" : "default"}
                        onClick={handleLogout}
                        className={cn("w-full mt-2 text-red-400 hover:text-red-300 hover:bg-red-900/20", collapsed && "px-0")}
                    >
                        <LogOut className="h-4 w-4" />
                        {!collapsed && <span>Sign Out</span>}
                    </Button>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl px-4 lg:px-6">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden text-slate-400 hover:text-white cursor-pointer"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <div className="flex-1" />
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400">
                            <Sparkles className="h-4 w-4 text-indigo-400" />
                            <span>AI-Powered Learning</span>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
