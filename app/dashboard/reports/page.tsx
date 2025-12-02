'use client';

import { useState, useEffect } from 'react';
import { reportsAPI } from '@/lib/api';

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState<'agent' | 'project' | 'daily'>('agent');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);

    // Date filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        fetchReport();
    }, [activeTab, startDate, endDate]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            let response;
            const params = {
                startDate: startDate || undefined,
                endDate: endDate || undefined
            };

            if (activeTab === 'agent') {
                response = await reportsAPI.getAgentPerformance(params);
            } else if (activeTab === 'project') {
                response = await reportsAPI.getProjectPerformance(params);
            } else {
                response = await reportsAPI.getDailyActivity(params);
            }

            if (response.success) {
                setData(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch report:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                <p className="text-sm text-gray-600">Monitor performance and activity</p>
            </div>

            {/* Filters */}
            <div className="card mb-6">
                <div className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                        />
                    </div>
                    <button
                        onClick={() => { setStartDate(''); setEndDate(''); }}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('agent')}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'agent'
                            ? 'border-[#468847] text-[#468847]'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Agent Performance
                </button>
                <button
                    onClick={() => setActiveTab('project')}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'project'
                            ? 'border-[#468847] text-[#468847]'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Project Performance
                </button>
                <button
                    onClick={() => setActiveTab('daily')}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'daily'
                            ? 'border-[#468847] text-[#468847]'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Daily Activity
                </button>
            </div>

            {/* Content */}
            <div className="card">
                {loading ? (
                    <div className="p-8 text-center text-gray-600">Loading report...</div>
                ) : data.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No data found for the selected period.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    {activeTab === 'agent' && (
                                        <>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Agent</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Code</th>
                                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Interactions</th>
                                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Calls</th>
                                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">SMS</th>
                                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">WhatsApp</th>
                                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Sales</th>
                                        </>
                                    )}
                                    {activeTab === 'project' && (
                                        <>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Project</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Code</th>
                                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Interactions</th>
                                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Sales Generated</th>
                                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Conversion Rate</th>
                                        </>
                                    )}
                                    {activeTab === 'daily' && (
                                        <>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Interactions</th>
                                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Sales Generated</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((row, index) => (
                                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                        {activeTab === 'agent' && (
                                            <>
                                                <td className="py-3 px-4 font-medium text-gray-900">{row.agent_name}</td>
                                                <td className="py-3 px-4 text-gray-600">{row.empcode}</td>
                                                <td className="py-3 px-4 text-right text-gray-900">{row.total_interactions}</td>
                                                <td className="py-3 px-4 text-right text-gray-600">{row.total_calls || 0}</td>
                                                <td className="py-3 px-4 text-right text-gray-600">{row.total_sms || 0}</td>
                                                <td className="py-3 px-4 text-right text-gray-600">{row.total_whatsapp || 0}</td>
                                                <td className="py-3 px-4 text-right font-medium text-green-600">{row.sales_generated || 0}</td>
                                            </>
                                        )}
                                        {activeTab === 'project' && (
                                            <>
                                                <td className="py-3 px-4 font-medium text-gray-900">{row.projectname}</td>
                                                <td className="py-3 px-4 text-gray-600">{row.projectcode}</td>
                                                <td className="py-3 px-4 text-right text-gray-900">{row.total_interactions}</td>
                                                <td className="py-3 px-4 text-right font-medium text-green-600">{row.sales_generated || 0}</td>
                                                <td className="py-3 px-4 text-right text-gray-600">
                                                    {row.total_interactions > 0
                                                        ? `${((row.sales_generated || 0) / row.total_interactions * 100).toFixed(1)}%`
                                                        : '0%'}
                                                </td>
                                            </>
                                        )}
                                        {activeTab === 'daily' && (
                                            <>
                                                <td className="py-3 px-4 font-medium text-gray-900">
                                                    {new Date(row.date).toLocaleDateString()}
                                                </td>
                                                <td className="py-3 px-4 text-right text-gray-900">{row.total_interactions}</td>
                                                <td className="py-3 px-4 text-right font-medium text-green-600">{row.sales_generated || 0}</td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
