'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MenuItem {
    name: string;
    nameBn: string;
    href: string;
    icon: JSX.Element;
    agentOnly?: boolean; // Only for agents/trainees
    adminOnly?: boolean; // Only for admins/managers
}

interface User {
    role: string;
    name: string;
    emailidoffical?: string;
    email?: string;
}

const menuItems: MenuItem[] = [
    {
        name: 'Dashboard',
        nameBn: 'ড্যাশবোর্ড',
        href: '/dashboard',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },
    {
        name: 'My Customers',
        nameBn: 'আমার কাস্টমার',
        href: '/dashboard/my-customers',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
        agentOnly: true, // Only agents and trainees see this
    },
    {
        name: 'Employees',
        nameBn: 'কর্মচারী',
        href: '/dashboard/employees',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        ),
        adminOnly: true, // Only admins and managers
    },
    {
        name: 'Teams',
        nameBn: 'টিম',
        href: '/dashboard/teams',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
        adminOnly: true,
    },
    {
        name: 'Projects',
        nameBn: 'প্রজেক্ট',
        href: '/dashboard/projects',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
        ),
        adminOnly: true,
    },
    {
        name: 'Customers',
        nameBn: 'কাস্টমার',
        href: '/dashboard/customers',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
        adminOnly: true,
    },
    {
        name: 'Customer Assign',
        nameBn: 'কাস্টমার অ্যাসাইন',
        href: '/dashboard/assign-customers',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
        ),
        adminOnly: true,
    },
    {
        name: 'Reports',
        nameBn: 'রিপোর্ট',
        href: '/dashboard/reports',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
        adminOnly: true,
    },
    {
        name: 'Settings',
        nameBn: 'সেটিংস',
        href: '/dashboard/settings',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        adminOnly: true,
    },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Load user from localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const userData = JSON.parse(userStr);
                setUser(userData);
                console.log('User loaded:', userData); // Debug log
            } catch (error) {
                console.error('Failed to parse user:', error);
            }
        }
    }, []);

    const isAgent = () => {
        if (!user || !user.role) return false;
        const role = user.role.toLowerCase();
        return role === 'agent' || role === 'trainee';
    };

    const isAdmin = () => {
        if (!user || !user.role) return false;
        const role = user.role.toLowerCase();
        return role === 'admin' || role === 'manager';
    };

    const canViewMenuItem = (item: MenuItem) => {
        // If it's agent-only, only agents/trainees can see it
        if (item.agentOnly) {
            return isAgent();
        }

        // If it's admin-only, only admins/managers can see it
        if (item.adminOnly) {
            return isAdmin();
        }

        // Otherwise, everyone can see it (like Dashboard)
        return true;
    };

    const visibleMenuItems = menuItems.filter(canViewMenuItem);

    return (
        <aside
            className={`bg-white border-r border-gray-200 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'
                } flex flex-col h-screen sticky top-0`}
        >
            {/* Logo */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    {!collapsed && (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#468847] to-[#9DC088] rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="font-bold text-[#222222]">Call Center</h2>
                                <p className="text-xs text-gray-500">CRM System</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg
                            className={`w-5 h-5 text-gray-600 transition-transform ${collapsed ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
                <ul className="space-y-2">
                    {visibleMenuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                        ? 'bg-gradient-to-r from-[#468847] to-[#9DC088] text-white shadow-md'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    title={collapsed ? item.name : ''}
                                >
                                    <span className={isActive ? 'text-white' : 'text-gray-600'}>
                                        {item.icon}
                                    </span>
                                    {!collapsed && (
                                        <div className="flex-1">
                                            <span className="font-medium">{item.name}</span>
                                            <p className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                                                {item.nameBn}
                                            </p>
                                        </div>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-gray-200">
                <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
                    <div className="w-10 h-10 bg-gradient-to-br from-[#7C71C2] to-[#9DC088] rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                    </div>
                    {!collapsed && (
                        <div className="flex-1">
                            <p className="font-medium text-sm text-gray-900">{user?.name || 'User'}</p>
                            <p className="text-xs text-gray-500">{user?.role || 'Role'}</p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
