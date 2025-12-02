'use client';

import { useState, useEffect } from 'react';
import { assignmentAPI } from '@/lib/api';

interface Customer {
    assignno_pk: number;
    custno_fk: number;
    custname: string;
    custcode: string;
    custmobilenumber: string;
    custemail: string;
    custtype: string;
    facebook_link: string | null;
    linkedin_link: string | null;
    other_link: string | null;
    custarea: string | null;
    custfeedback: string | null;
    never_callind: string | null;
    projectname: string;
    projectcode: string;
    assigndate: string;
    calltargetdate: string | null;
    calleddatetime: string | null;
    callpriority: string;
    callstatus: string;
    callstatus_text: string | null;
    followupdate: string | null;
    count_call: number;
    count_message: number;
}

interface Pagination {
    currentPage: number;
    totalPages: number;
    totalCustomers: number;
    limit: number;
}

export default function MyCustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<Pagination>({
        currentPage: 1,
        totalPages: 1,
        totalCustomers: 0,
        limit: 10
    });

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Modal states
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);
    const [interactionType, setInteractionType] = useState<'call' | 'sms' | 'whatsapp'>('call');

    const [interactionData, setInteractionData] = useState({
        callstatus: '',
        callstatus_text: '',
        followupdate: '',
        followuptime: ''
    });

    useEffect(() => {
        fetchMyCustomers();
    }, [currentPage, itemsPerPage, searchTerm, statusFilter, priorityFilter]);

    const fetchMyCustomers = async () => {
        try {
            setLoading(true);
            const response = await assignmentAPI.getMyCustomers({
                page: currentPage,
                limit: itemsPerPage,
                search: searchTerm,
                callstatus: statusFilter,
                callpriority: priorityFilter
            });

            if (response.success) {
                setCustomers(response.data);
                if (response.pagination) {
                    setPagination(response.pagination);
                }
            }
        } catch (error) {
            console.error('Failed to fetch customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenInteraction = (customer: Customer, type: 'call' | 'sms' | 'whatsapp') => {
        setSelectedCustomer(customer);
        setInteractionType(type);
        setInteractionData({
            callstatus: customer.callstatus || '',
            callstatus_text: customer.callstatus_text || '',
            followupdate: customer.followupdate ? new Date(customer.followupdate).toISOString().split('T')[0] : '',
            followuptime: customer.followupdate ? new Date(customer.followupdate).toISOString().split('T')[1].substring(0, 5) : ''
        });
        setIsInteractionModalOpen(true);
    };

    const handleCloseInteraction = () => {
        setIsInteractionModalOpen(false);
        setSelectedCustomer(null);
        setInteractionData({
            callstatus: '',
            callstatus_text: '',
            followupdate: '',
            followuptime: ''
        });
    };

    const handleSubmitInteraction = async () => {
        if (!selectedCustomer) return;

        try {
            const followupdatetime = interactionData.followupdate && interactionData.followuptime
                ? `${interactionData.followupdate}T${interactionData.followuptime}:00`
                : null;

            const updateData: any = {
                calleddatetime: new Date().toISOString(),
                callstatus: interactionData.callstatus,
                callstatus_text: interactionData.callstatus_text,
                followupdate: followupdatetime
            };

            if (interactionType === 'call') {
                updateData.count_call = (selectedCustomer.count_call || 0) + 1;
            } else {
                updateData.count_message = (selectedCustomer.count_message || 0) + 1;
            }

            await assignmentAPI.updateInteraction(selectedCustomer.assignno_pk, updateData);

            alert(`${interactionType.toUpperCase()} interaction recorded successfully!`);
            handleCloseInteraction();
            fetchMyCustomers();
        } catch (error: any) {
            console.error('Failed to record interaction:', error);
            alert(error.message || 'Failed to record interaction');
        }
    };

    const getPriorityColor = (priority: string) => {
        const colors: Record<string, string> = {
            'High': 'bg-red-100 text-red-800',
            'Medium': 'bg-yellow-100 text-yellow-800',
            'Low': 'bg-green-100 text-green-800'
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'Pending': 'bg-blue-100 text-blue-800',
            'Sales Generated': 'bg-green-100 text-green-800',
            'Received': 'bg-teal-100 text-teal-800',
            'Not Reachable': 'bg-orange-100 text-orange-800',
            'No Responsive': 'bg-red-100 text-red-800',
            'Closed': 'bg-gray-100 text-gray-800',
            'Not Relevant': 'bg-purple-100 text-purple-800',
            'Scheduled': 'bg-indigo-100 text-indigo-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    const formatDateTime = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString();
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">My Customers</h1>
                <p className="text-sm text-gray-600">Manage your assigned customers and interactions</p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="card">
                    <div className="text-2xl font-bold text-gray-900">{pagination.totalCustomers}</div>
                    <div className="text-sm text-gray-600">Total Customers</div>
                </div>
                <div className="card">
                    <div className="text-2xl font-bold text-green-600">
                        {customers.filter(c => c.callstatus === 'Sales Generated').length}
                    </div>
                    <div className="text-sm text-gray-600">Sales Generated</div>
                </div>
                <div className="card">
                    <div className="text-2xl font-bold text-blue-600">
                        {customers.filter(c => c.callstatus === 'Pending').length}
                    </div>
                    <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="card">
                    <div className="text-2xl font-bold text-red-600">
                        {customers.filter(c => c.callpriority === 'High').length}
                    </div>
                    <div className="text-sm text-gray-600">High Priority</div>
                </div>
            </div>

            {/* Filters */}
            <div className="card mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <input
                            type="text"
                            placeholder="Search by name or mobile..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                        >
                            <option value="">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Sales Generated">Sales Generated</option>
                            <option value="Received">Received</option>
                            <option value="Not Reachable">Not Reachable</option>
                            <option value="No Responsive">No Responsive</option>
                            <option value="Closed">Closed</option>
                            <option value="Not Relevant">Not Relevant</option>
                            <option value="Scheduled">Scheduled</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select
                            value={priorityFilter}
                            onChange={(e) => {
                                setPriorityFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                        >
                            <option value="">All Priority</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Per Page</label>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(parseInt(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Customer List */}
            <div className="card">
                {loading ? (
                    <div className="p-8 text-center text-gray-600">Loading customers...</div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Contact</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Project</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Priority</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Target Date</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Interactions</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customers.map((customer) => (
                                        <tr key={customer.assignno_pk} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-4 px-4">
                                                <div className="font-medium text-gray-900">{customer.custname}</div>
                                                <div className="text-xs text-gray-500">{customer.custcode}</div>
                                                {customer.never_callind === 'Y' && (
                                                    <span className="text-xs text-red-600 font-bold">🚫 DO NOT CALL</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="text-sm text-gray-900">{customer.custmobilenumber}</div>
                                                <div className="text-xs text-gray-500">{customer.custemail || '-'}</div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="text-sm text-gray-900">{customer.projectname}</div>
                                                <div className="text-xs text-gray-500">{customer.projectcode}</div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(customer.callpriority)}`}>
                                                    {customer.callpriority}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(customer.callstatus)}`}>
                                                    {customer.callstatus}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-sm text-gray-600">
                                                {formatDate(customer.calltargetdate)}
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="text-xs text-gray-600">
                                                    📞 {customer.count_call || 0} calls
                                                </div>
                                                <div className="text-xs text-gray-600">
                                                    💬 {customer.count_message || 0} messages
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => handleOpenInteraction(customer, 'call')}
                                                        disabled={customer.never_callind === 'Y'}
                                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Call"
                                                    >
                                                        📞 Call
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenInteraction(customer, 'sms')}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium"
                                                        title="SMS"
                                                    >
                                                        💬 SMS
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenInteraction(customer, 'whatsapp')}
                                                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium"
                                                        title="WhatsApp"
                                                    >
                                                        📱 WA
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {customers.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                                No customers assigned to you yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                                <div className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, pagination.totalCustomers)}</span> of{' '}
                                    <span className="font-medium">{pagination.totalCustomers}</span> customers
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>

                                    {[...Array(pagination.totalPages)].map((_, index) => {
                                        const page = index + 1;
                                        if (
                                            page === 1 ||
                                            page === pagination.totalPages ||
                                            (page >= currentPage - 1 && page <= currentPage + 1)
                                        ) {
                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`px-3 py-1 border rounded-lg text-sm font-medium ${currentPage === page
                                                        ? 'bg-[#468847] text-white border-[#468847]'
                                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                                            return <span key={page} className="px-2">...</span>;
                                        }
                                        return null;
                                    })}

                                    <button
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        disabled={currentPage === pagination.totalPages}
                                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Interaction Modal */}
            {isInteractionModalOpen && selectedCustomer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {interactionType === 'call' ? '📞 Call' : interactionType === 'sms' ? '💬 SMS' : '📱 WhatsApp'} - {selectedCustomer.custname}
                                </h2>
                                <p className="text-sm text-gray-600">{selectedCustomer.custmobilenumber}</p>
                            </div>
                            <button onClick={handleCloseInteraction} className="text-gray-400 hover:text-gray-600">
                                ✕
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Customer Info */}
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Project:</span>
                                        <span className="ml-2 font-medium">{selectedCustomer.projectname}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Area:</span>
                                        <span className="ml-2 font-medium">{selectedCustomer.custarea || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Previous Calls:</span>
                                        <span className="ml-2 font-medium">{selectedCustomer.count_call || 0}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Last Called:</span>
                                        <span className="ml-2 font-medium">{formatDateTime(selectedCustomer.calleddatetime)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Call Result */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Call Result *</label>
                                <select
                                    value={interactionData.callstatus}
                                    onChange={(e) => setInteractionData({ ...interactionData, callstatus: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                    required
                                >
                                    <option value="">Select result</option>
                                    <option value="Sales Generated">Sales Generated</option>
                                    <option value="Received">Received</option>
                                    <option value="Not Reachable">Not Reachable</option>
                                    <option value="No Responsive">No Responsive</option>
                                    <option value="Closed">Closed</option>
                                    <option value="Not Relevant">Not Relevant</option>
                                    <option value="Scheduled">Scheduled</option>
                                </select>
                            </div>

                            {/* Response Message */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Response Message</label>
                                <textarea
                                    value={interactionData.callstatus_text}
                                    onChange={(e) => setInteractionData({ ...interactionData, callstatus_text: e.target.value })}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                    placeholder="Enter notes about this interaction..."
                                />
                            </div>

                            {/* Schedule Follow-up */}
                            <div className="border-t pt-4">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">Schedule Next Communication</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                        <input
                                            type="date"
                                            value={interactionData.followupdate}
                                            onChange={(e) => setInteractionData({ ...interactionData, followupdate: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                        <input
                                            type="time"
                                            value={interactionData.followuptime}
                                            onChange={(e) => setInteractionData({ ...interactionData, followuptime: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={handleCloseInteraction}
                                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitInteraction}
                                disabled={!interactionData.callstatus}
                                className="bg-gradient-to-r from-[#468847] to-[#9DC088] hover:opacity-90 text-white px-6 py-2 rounded-lg transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Save Interaction
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
