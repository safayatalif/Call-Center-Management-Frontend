'use client';

import { useState, useEffect } from 'react';
import { customerAPI, projectAPI } from '@/lib/api';

interface Customer {
    custno_pk: number;
    custcode: string | null;
    projectno_fk: number | null;
    countrycode: string;
    custmobilenumber: string | null;
    custemail: string | null;
    custname: string | null;
    facebook_link: string | null;
    linkedin_link: string | null;
    other_link: string | null;
    call_link_type: string | null;
    text_note: string | null;
    contact_type: string | null;
    custarea: string | null;
    custfeedback: string | null;
    agentfeedback: string | null;
    never_callind: string | null;
    never_callind_message: string | null;
    custgender: string | null;
    custbirthdate: string | null;
    custtype: string;
    cust_labeling: string | null;
    project_name: string | null;
    project_code: string | null;
    au_entryat: string;
}

interface Project {
    projectno_pk: number;
    projectname: string;
    projectcode: string;
}

interface Pagination {
    currentPage: number;
    totalPages: number;
    totalCustomers: number;
    limit: number;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<Pagination>({
        currentPage: 1,
        totalPages: 1,
        totalCustomers: 0,
        limit: 10
    });

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [projectFilter, setProjectFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

    const [formData, setFormData] = useState({
        custcode: '',
        projectno_fk: null as number | null,
        countrycode: '+880',
        custmobilenumber: '',
        custemail: '',
        custname: '',
        facebook_link: '',
        linkedin_link: '',
        other_link: '',
        call_link_type: '',
        text_note: '',
        contact_type: '',
        custarea: '',
        custfeedback: '',
        agentfeedback: '',
        never_callind: 'N',
        never_callind_message: '',
        custgender: '',
        custbirthdate: '',
        custtype: 'New',
        cust_labeling: '',
        au_orgno: 0
    });

    useEffect(() => {
        fetchCustomers();
        fetchProjects();
    }, [currentPage, itemsPerPage, searchTerm, projectFilter, typeFilter]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await customerAPI.getAll({
                page: currentPage,
                limit: itemsPerPage,
                search: searchTerm,
                projectId: projectFilter ? parseInt(projectFilter) : undefined,
                custtype: typeFilter
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

    const fetchProjects = async () => {
        try {
            const response = await projectAPI.getAll({ limit: 1000 });
            if (response.success) {
                setProjects(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        }
    };

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handleProjectFilter = (value: string) => {
        setProjectFilter(value);
        setCurrentPage(1);
    };

    const handleTypeFilter = (value: string) => {
        setTypeFilter(value);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleOpenModal = (customer: Customer | null = null) => {
        if (customer) {
            setEditingCustomer(customer);
            setFormData({
                custcode: customer.custcode || '',
                projectno_fk: customer.projectno_fk,
                countrycode: customer.countrycode || '+880',
                custmobilenumber: customer.custmobilenumber || '',
                custemail: customer.custemail || '',
                custname: customer.custname || '',
                facebook_link: customer.facebook_link || '',
                linkedin_link: customer.linkedin_link || '',
                other_link: customer.other_link || '',
                call_link_type: customer.call_link_type || '',
                text_note: customer.text_note || '',
                contact_type: customer.contact_type || '',
                custarea: customer.custarea || '',
                custfeedback: customer.custfeedback || '',
                agentfeedback: customer.agentfeedback || '',
                never_callind: customer.never_callind || 'N',
                never_callind_message: customer.never_callind_message || '',
                custgender: customer.custgender || '',
                custbirthdate: customer.custbirthdate || '',
                custtype: customer.custtype || 'New',
                cust_labeling: customer.cust_labeling || '',
                au_orgno: 0
            });
        } else {
            setEditingCustomer(null);
            setFormData({
                custcode: '',
                projectno_fk: null,
                countrycode: '+880',
                custmobilenumber: '',
                custemail: '',
                custname: '',
                facebook_link: '',
                linkedin_link: '',
                other_link: '',
                call_link_type: '',
                text_note: '',
                contact_type: '',
                custarea: '',
                custfeedback: '',
                agentfeedback: '',
                never_callind: 'N',
                never_callind_message: '',
                custgender: '',
                custbirthdate: '',
                custtype: 'New',
                cust_labeling: '',
                au_orgno: 0
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCustomer(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCustomer) {
                await customerAPI.update(editingCustomer.custno_pk, formData);
            } else {
                await customerAPI.create(formData);
            }
            fetchCustomers();
            handleCloseModal();
        } catch (error: any) {
            console.error('Failed to save customer:', error);
            alert(error.message || 'Failed to save customer');
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
            try {
                await customerAPI.delete(id);
                fetchCustomers();
            } catch (error) {
                console.error('Failed to delete customer:', error);
                alert('Failed to delete customer');
            }
        }
    };

    const getTypeBadgeColor = (type: string) => {
        const colors: Record<string, string> = {
            'Undefined': 'bg-gray-900 text-gray-300',
            'New': 'bg-green-900 text-green-300',
            'Regular': 'bg-blue-900 text-blue-300',
            'Reorder': 'bg-purple-900 text-purple-300'
        };
        return colors[type] || 'bg-gray-900 text-gray-300';
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
                    <p className="text-sm text-gray-600">Manage customers and project assignments</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-gradient-to-r from-[#468847] to-[#9DC088] hover:opacity-90 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 shadow-md"
                >
                    <span>+</span> Create Customer
                </button>
            </div>

            {/* Filters */}
            <div className="card mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <input
                            type="text"
                            placeholder="Search by name, code, mobile..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                        <select
                            value={projectFilter}
                            onChange={(e) => handleProjectFilter(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                        >
                            <option value="">All Projects</option>
                            {projects.map((project) => (
                                <option key={project.projectno_pk} value={project.projectno_pk}>
                                    {project.projectname}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type</label>
                        <select
                            value={typeFilter}
                            onChange={(e) => handleTypeFilter(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                        >
                            <option value="">All Types</option>
                            <option value="Undefined">Undefined</option>
                            <option value="New">New</option>
                            <option value="Regular">Regular</option>
                            <option value="Reorder">Reorder</option>
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
                    <div className="p-8 text-center text-gray-600">Loading customers...</div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Code</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer Name</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Contact Info</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Project</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Links</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customers.map((customer) => (
                                        <tr key={customer.custno_pk} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-4 text-gray-600">{customer.custcode || '-'}</td>
                                            <td className="py-4 px-4">
                                                <div className="font-medium text-gray-900">{customer.custname || 'Unknown'}</div>
                                                {customer.never_callind === 'Y' && (
                                                    <span className="text-xs text-red-600 font-bold">🚫 DO NOT CALL</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="text-sm text-gray-900">{customer.custmobilenumber || '-'}</div>
                                                <div className="text-xs text-gray-500">{customer.custemail || ''}</div>
                                            </td>
                                            <td className="py-4 px-4">
                                                {customer.project_name ? (
                                                    <div>
                                                        <div className="font-medium text-gray-900">{customer.project_name}</div>
                                                        <div className="text-xs text-gray-500">{customer.project_code}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">No project</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeBadgeColor(customer.custtype)}`}>
                                                    {customer.custtype}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex gap-2">
                                                    {customer.facebook_link && (
                                                        <a href={customer.facebook_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">FB</a>
                                                    )}
                                                    {customer.linkedin_link && (
                                                        <a href={customer.linkedin_link} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900">LI</a>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-right space-x-2">
                                                <button
                                                    onClick={() => handleOpenModal(customer)}
                                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(customer.custno_pk)}
                                                    className="text-red-600 hover:text-red-800 font-medium"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {customers.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                                No customers found. Create your first customer!
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
                                        onClick={() => handlePageChange(currentPage - 1)}
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

            {/* Create/Edit Customer Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingCustomer ? 'Edit Customer' : 'Create New Customer'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Basic Info */}
                                <div className="md:col-span-3">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Basic Information</h3>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Code</label>
                                    <input
                                        type="text"
                                        value={formData.custcode}
                                        onChange={(e) => setFormData({ ...formData, custcode: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                        placeholder="e.g., CUST001"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                                    <input
                                        type="text"
                                        value={formData.custname}
                                        onChange={(e) => setFormData({ ...formData, custname: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                        placeholder="Enter name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Project</label>
                                    <select
                                        value={formData.projectno_fk || ''}
                                        onChange={(e) => setFormData({ ...formData, projectno_fk: e.target.value ? parseInt(e.target.value) : null })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                    >
                                        <option value="">Select project</option>
                                        {projects.map((project) => (
                                            <option key={project.projectno_pk} value={project.projectno_pk}>
                                                {project.projectname}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Contact Info */}
                                <div className="md:col-span-3 mt-4">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Contact Details</h3>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                                    <input
                                        type="text"
                                        value={formData.custmobilenumber}
                                        onChange={(e) => setFormData({ ...formData, custmobilenumber: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                        placeholder="Enter mobile number"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={formData.custemail}
                                        onChange={(e) => setFormData({ ...formData, custemail: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                        placeholder="Enter email"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                                    <input
                                        type="text"
                                        value={formData.custarea}
                                        onChange={(e) => setFormData({ ...formData, custarea: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                        placeholder="Enter area"
                                    />
                                </div>

                                {/* Social Links */}
                                <div className="md:col-span-3 mt-4">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Social Links</h3>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Facebook Link</label>
                                    <input
                                        type="text"
                                        value={formData.facebook_link}
                                        onChange={(e) => setFormData({ ...formData, facebook_link: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                        placeholder="Facebook URL"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Link</label>
                                    <input
                                        type="text"
                                        value={formData.linkedin_link}
                                        onChange={(e) => setFormData({ ...formData, linkedin_link: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                        placeholder="LinkedIn URL"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Other Link</label>
                                    <input
                                        type="text"
                                        value={formData.other_link}
                                        onChange={(e) => setFormData({ ...formData, other_link: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                        placeholder="Other URL"
                                    />
                                </div>

                                {/* Additional Info */}
                                <div className="md:col-span-3 mt-4">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Additional Information</h3>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type</label>
                                    <select
                                        value={formData.custtype}
                                        onChange={(e) => setFormData({ ...formData, custtype: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                    >
                                        <option value="Undefined">Undefined</option>
                                        <option value="New">New</option>
                                        <option value="Regular">Regular</option>
                                        <option value="Reorder">Reorder</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                    <select
                                        value={formData.custgender}
                                        onChange={(e) => setFormData({ ...formData, custgender: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
                                    <input
                                        type="date"
                                        value={formData.custbirthdate}
                                        onChange={(e) => setFormData({ ...formData, custbirthdate: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                    />
                                </div>

                                <div className="md:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Call Link Types</label>
                                    <input
                                        type="text"
                                        value={formData.call_link_type}
                                        onChange={(e) => setFormData({ ...formData, call_link_type: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                        placeholder="e.g., Mobile, Facebook, WhatsApp (comma separated)"
                                    />
                                </div>

                                <div className="md:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Text Note</label>
                                    <textarea
                                        value={formData.text_note}
                                        onChange={(e) => setFormData({ ...formData, text_note: e.target.value })}
                                        rows={2}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                        placeholder="Internal notes"
                                    />
                                </div>

                                <div className="md:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Feedback</label>
                                    <textarea
                                        value={formData.custfeedback}
                                        onChange={(e) => setFormData({ ...formData, custfeedback: e.target.value })}
                                        rows={2}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                        placeholder="Feedback from customer"
                                    />
                                </div>

                                <div className="md:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Agent Feedback</label>
                                    <textarea
                                        value={formData.agentfeedback}
                                        onChange={(e) => setFormData({ ...formData, agentfeedback: e.target.value })}
                                        rows={2}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                        placeholder="Feedback from agent"
                                    />
                                </div>

                                <div className="md:col-span-3 border-t pt-4">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="never_call"
                                            checked={formData.never_callind === 'Y'}
                                            onChange={(e) => setFormData({ ...formData, never_callind: e.target.checked ? 'Y' : 'N' })}
                                            className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                        />
                                        <label htmlFor="never_call" className="ml-2 text-sm font-bold text-red-700">
                                            NEVER CALL INDICATOR
                                        </label>
                                    </div>
                                    {formData.never_callind === 'Y' && (
                                        <div className="mt-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Reason / Message</label>
                                            <input
                                                type="text"
                                                value={formData.never_callind_message}
                                                onChange={(e) => setFormData({ ...formData, never_callind_message: e.target.value })}
                                                className="w-full border border-red-300 rounded-lg px-4 py-2 focus:outline-none focus:border-red-500 bg-red-50"
                                                placeholder="Why should we not call this customer?"
                                            />
                                        </div>
                                    )}
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
                                    {editingCustomer ? 'Update Customer' : 'Create Customer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
