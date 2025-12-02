'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { dashboardAPI } from '@/lib/api';

interface DashboardStats {
    totalAgents: number;
    totalProjects: number;
    totalCalls: number;
    pendingCalls: number;
}

interface Call {
    id: number;
    customer_name: string;
    customer_phone: string;
    status: string;
    agent_name: string;
    project_name: string;
    created_at: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats>({
        totalAgents: 0,
        totalProjects: 0,
        totalCalls: 0,
        pendingCalls: 0,
    });
    const [recentCalls, setRecentCalls] = useState<Call[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check authentication
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        // Check user role
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                const role = user.role?.toLowerCase();

                // Redirect agents/trainees to My Customers
                if (role === 'agent' || role === 'trainee') {
                    router.push('/dashboard/my-customers');
                    return;
                }

                setUserName(user.name || 'Admin');
            } catch (error) {
                console.error('Failed to parse user:', error);
            }
        }

        // Fetch dashboard data
        fetchDashboardData();
    }, []);

    const [userName, setUserName] = useState('Admin');

    const fetchDashboardData = async () => {
        try {
            const response = await dashboardAPI.getStats();
            if (response.success) {
                setStats(response.data.stats);
                setRecentCalls(response.data.recentCalls);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            // Use mock data for demo
            setStats({
                totalAgents: 24,
                totalProjects: 8,
                totalCalls: 1247,
                pendingCalls: 156,
            });
            setRecentCalls([
                {
                    id: 1,
                    customer_name: 'রহিম আহমেদ',
                    customer_phone: '+880 1712-345678',
                    status: 'completed',
                    agent_name: 'জন ডো',
                    project_name: 'প্রজেক্ট আলফা',
                    created_at: new Date().toISOString(),
                },
                {
                    id: 2,
                    customer_name: 'করিম খান',
                    customer_phone: '+880 1812-345678',
                    status: 'pending',
                    agent_name: 'জেন স্মিথ',
                    project_name: 'প্রজেক্ট বেটা',
                    created_at: new Date().toISOString(),
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Total Agents',
            titleBn: 'মোট এজেন্ট',
            value: stats.totalAgents,
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            color: 'border-[#468847]',
            bgColor: 'bg-[#9DC088]/10',
            textColor: 'text-[#468847]',
            change: '+12%',
        },
        {
            title: 'Active Projects',
            titleBn: 'সক্রিয় প্রজেক্ট',
            value: stats.totalProjects,
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            ),
            color: 'border-[#7C71C2]',
            bgColor: 'bg-[#7C71C2]/10',
            textColor: 'text-[#7C71C2]',
            change: '+5%',
        },
        {
            title: 'Total Calls',
            titleBn: 'মোট কল',
            value: stats.totalCalls,
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
            ),
            color: 'border-[#9DC088]',
            bgColor: 'bg-[#9DC088]/10',
            textColor: 'text-[#468847]',
            change: '+23%',
        },
        {
            title: 'Pending Calls',
            titleBn: 'অপেক্ষমাণ কল',
            value: stats.pendingCalls,
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'border-[#F6E18D]',
            bgColor: 'bg-[#F6E18D]/20',
            textColor: 'text-[#d4a017]',
            change: '-8%',
        },
    ];

    const getStatusBadge = (status: string) => {
        const badges: Record<string, string> = {
            completed: 'badge-success',
            pending: 'badge-warning',
            failed: 'badge-danger',
            in_progress: 'badge-info',
        };
        return badges[status] || 'badge-info';
    };

    const getStatusText = (status: string) => {
        const texts: Record<string, string> = {
            completed: 'সম্পন্ন',
            pending: 'অপেক্ষমাণ',
            failed: 'ব্যর্থ',
            in_progress: 'চলমান',
        };
        return texts[status] || status;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#468847] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome back, {userName}! 👋
                </h1>
                <p className="text-gray-600">
                    Here's what's happening with your call center today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, index) => (
                    <div
                        key={index}
                        className={`stat-card ${stat.color} animate-fadeIn`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-600 mb-1">
                                    {stat.title}
                                </p>
                                <p className="text-xs text-gray-500 mb-3">{stat.titleBn}</p>
                                <p className="text-3xl font-bold text-gray-900 mb-2">
                                    {stat.value.toLocaleString()}
                                </p>
                                <div className="flex items-center gap-1">
                                    <span
                                        className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                                            }`}
                                    >
                                        {stat.change}
                                    </span>
                                    <span className="text-xs text-gray-500">from last month</span>
                                </div>
                            </div>
                            <div className={`${stat.bgColor} ${stat.textColor} p-3 rounded-lg`}>
                                {stat.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Calls Table */}
            <div className="card animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Recent Calls</h2>
                        <p className="text-sm text-gray-500">সাম্প্রতিক কল তালিকা</p>
                    </div>
                    <button className="btn btn-outline">
                        View All
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                    Customer
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                    Phone
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                    Agent
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                    Project
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                    Status
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                    Time
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentCalls.map((call) => (
                                <tr
                                    key={call.id}
                                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                >
                                    <td className="py-4 px-4">
                                        <p className="font-medium text-gray-900">{call.customer_name}</p>
                                    </td>
                                    <td className="py-4 px-4 text-gray-600">{call.customer_phone}</td>
                                    <td className="py-4 px-4 text-gray-600">{call.agent_name}</td>
                                    <td className="py-4 px-4 text-gray-600">{call.project_name}</td>
                                    <td className="py-4 px-4">
                                        <span className={`badge ${getStatusBadge(call.status)}`}>
                                            {getStatusText(call.status)}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-sm text-gray-500">
                                        {new Date(call.created_at).toLocaleTimeString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
