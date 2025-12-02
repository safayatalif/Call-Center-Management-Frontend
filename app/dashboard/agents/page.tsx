'use client';

import { useState, useEffect } from 'react';
import { userAPI } from '@/lib/api';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'ADMIN' | 'MANAGER' | 'AGENT' | 'TRAINEE';
    capacity: number;
    personal_numbers: string | null;
    official_numbers: string | null;
    social_ids: any;
    address: string | null;
    remarks: string | null;
    status: 'active' | 'inactive' | 'close';
    restricted_data_privilege: boolean;
    created_at: string;
}

interface Pagination {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    limit: number;
}

export default function AgentsPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<Pagination>({
        currentPage: 1,
        totalPages: 1,
        totalUsers: 0,
        limit: 10
    });

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'AGENT' as 'ADMIN' | 'MANAGER' | 'AGENT' | 'TRAINEE',
        capacity: 0,
        personal_numbers: '',
        official_numbers: '',
        social_ids: { facebook: '', whatsapp: '', telegram: '' },
        address: '',
        remarks: '',
        status: 'active' as 'active' | 'inactive' | 'close',
        restricted_data_privilege: false
    });

    useEffect(() => {
        fetchUsers();
    }, [currentPage, itemsPerPage, searchTerm, roleFilter, statusFilter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userAPI.getAll({
                page: currentPage,
                limit: itemsPerPage,
                search: searchTerm,
                role: roleFilter,
                status: statusFilter
            });

            if (response.success) {
                setUsers(response.data);
                if (response.pagination) {
                    setPagination(response.pagination);
                }
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1); // Reset to first page on search
    };

    const handleRoleFilter = (value: string) => {
        setRoleFilter(value);
        setCurrentPage(1);
    };

    const handleStatusFilter = (value: string) => {
        setStatusFilter(value);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleOpenModal = (user: User | null = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                password: '',
                role: user.role,
                capacity: user.capacity,
                personal_numbers: user.personal_numbers || '',
                official_numbers: user.official_numbers || '',
                social_ids: user.social_ids || { facebook: '', whatsapp: '', telegram: '' },
                address: user.address || '',
                remarks: user.remarks || '',
                status: user.status,
                restricted_data_privilege: user.restricted_data_privilege
            });
        } else {
            setEditingUser(null);
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'AGENT',
                capacity: 0,
                personal_numbers: '',
                official_numbers: '',
                social_ids: { facebook: '', whatsapp: '', telegram: '' },
                address: '',
                remarks: '',
                status: 'active',
                restricted_data_privilege: false
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const submitData = { ...formData };
            if (editingUser && !submitData.password) {
                delete (submitData as any).password;
            }

            if (editingUser) {
                await userAPI.update(editingUser.id, submitData);
            } else {
                await userAPI.create(submitData);
            }
            fetchUsers();
            handleCloseModal();
        } catch (error: any) {
            console.error('Failed to save user:', error);
            alert(error.message || 'Failed to save user');
        }
    };

    const handleInactivate = async (id: number) => {
        if (confirm('Are you sure you want to inactivate this user?')) {
            try {
                await userAPI.inactivate(id);
                fetchUsers();
            } catch (error) {
                console.error('Failed to inactivate user:', error);
                alert('Failed to inactivate user');
            }
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
            try {
                await userAPI.delete(id);
                fetchUsers();
            } catch (error) {
                console.error('Failed to delete user:', error);
                alert('Failed to delete user');
            }
        }
    };

    const getRoleBadgeColor = (role: string) => {
        const colors: Record<string, string> = {
            ADMIN: 'bg-red-900 text-red-300',
            MANAGER: 'bg-purple-900 text-purple-300',
            AGENT: 'bg-blue-900 text-blue-300',
            TRAINEE: 'bg-yellow-900 text-yellow-300'
        };
        return colors[role] || 'bg-gray-900 text-gray-300';
    };

    const getStatusBadgeColor = (status: string) => {
        const colors: Record<string, string> = {
            active: 'bg-green-900 text-green-300',
            inactive: 'bg-yellow-900 text-yellow-300',
            close: 'bg-red-900 text-red-300'
        };
        return colors[status] || 'bg-gray-900 text-gray-300';
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-sm text-gray-600">Manage system users and their permissions</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-gradient-to-r from-[#468847] to-[#9DC088] hover:opacity-90 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 shadow-md"
                >
                    <span>+</span> Add User
                </button>
            </div>

            {/* Filters */}
            <div className="card mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                            value={roleFilter}
                            onChange={(e) => handleRoleFilter(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                        >
                            <option value="">All Roles</option>
                            <option value="ADMIN">ADMIN</option>
                            <option value="MANAGER">MANAGER</option>
                            <option value="AGENT">AGENT</option>
                            <option value="TRAINEE">TRAINEE</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => handleStatusFilter(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="close">Close</option>
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

            {/* Table */}
            <div className="card">
                {loading ? (
                    <div className="p-8 text-center text-gray-600">Loading users...</div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Role</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Capacity</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Contact</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-4">
                                                <div className="font-medium text-gray-900">{user.name}</div>
                                                {user.restricted_data_privilege && (
                                                    <span className="text-xs text-red-600">🔒 Restricted</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 text-gray-600">{user.email}</td>
                                            <td className="py-4 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-gray-600">{user.capacity}</td>
                                            <td className="py-4 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(user.status)}`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-sm text-gray-600">
                                                {user.official_numbers || user.personal_numbers || '-'}
                                            </td>
                                            <td className="py-4 px-4 text-right space-x-2">
                                                <button
                                                    onClick={() => handleOpenModal(user)}
                                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    Edit
                                                </button>
                                                {user.status === 'active' && (
                                                    <button
                                                        onClick={() => handleInactivate(user.id)}
                                                        className="text-yellow-600 hover:text-yellow-800 font-medium"
                                                    >
                                                        Inactivate
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="text-red-600 hover:text-red-800 font-medium"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                                No users found. Try adjusting your filters.
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
                                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, pagination.totalUsers)}</span> of{' '}
                                    <span className="font-medium">{pagination.totalUsers}</span> users
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>

                                    {[...Array(pagination.totalPages)].map((_, index) => {
                                        const page = index + 1;
                                        // Show first page, last page, current page, and pages around current
                                        if (
                                            page === 1 ||
                                            page === pagination.totalPages ||
                                            (page >= currentPage - 1 && page <= currentPage + 1)
                                        ) {
                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
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
                                        onClick={() => handlePageChange(currentPage + 1)}
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

            {/* Modal - Same as before */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingUser ? 'Edit User' : 'Create New User'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Basic Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Password {editingUser ? '(leave blank to keep current)' : '*'}
                                        </label>
                                        <input
                                            type="password"
                                            required={!editingUser}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                        >
                                            <option value="ADMIN">ADMIN</option>
                                            <option value="MANAGER">MANAGER</option>
                                            <option value="AGENT">AGENT</option>
                                            <option value="TRAINEE">TRAINEE</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                                        <input
                                            type="number"
                                            value={formData.capacity}
                                            onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="close">Close</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Personal Numbers</label>
                                        <input
                                            type="text"
                                            value={formData.personal_numbers}
                                            onChange={(e) => setFormData({ ...formData, personal_numbers: e.target.value })}
                                            placeholder="e.g., +880 1712-345678"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Official Numbers</label>
                                        <input
                                            type="text"
                                            value={formData.official_numbers}
                                            onChange={(e) => setFormData({ ...formData, official_numbers: e.target.value })}
                                            placeholder="e.g., +880 1712-345678"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                        <textarea
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            rows={2}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Social IDs */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media IDs</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                                        <input
                                            type="text"
                                            value={formData.social_ids.facebook || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                social_ids: { ...formData.social_ids, facebook: e.target.value }
                                            })}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                                        <input
                                            type="text"
                                            value={formData.social_ids.whatsapp || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                social_ids: { ...formData.social_ids, whatsapp: e.target.value }
                                            })}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Telegram</label>
                                        <input
                                            type="text"
                                            value={formData.social_ids.telegram || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                social_ids: { ...formData.social_ids, telegram: e.target.value }
                                            })}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Additional Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                                        <textarea
                                            value={formData.remarks}
                                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                            rows={3}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="restricted_data_privilege"
                                            checked={formData.restricted_data_privilege}
                                            onChange={(e) => setFormData({ ...formData, restricted_data_privilege: e.target.checked })}
                                            className="w-4 h-4 rounded border-gray-300 text-[#468847] focus:ring-[#468847]"
                                        />
                                        <label htmlFor="restricted_data_privilege" className="text-sm font-medium text-gray-700">
                                            Restricted Data Privilege (User can only access assigned data)
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-gradient-to-r from-[#468847] to-[#9DC088] hover:opacity-90 text-white px-6 py-2 rounded-lg transition-all shadow-md"
                                >
                                    {editingUser ? 'Update User' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
