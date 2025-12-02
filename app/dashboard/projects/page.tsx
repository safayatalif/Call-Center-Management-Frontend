'use client';

import { useState, useEffect } from 'react';
import { projectAPI, teamAPI } from '@/lib/api';

interface Project {
    projectno_pk: number;
    projectcode: string | null;
    projectname: string;
    projectstartdate: string | null;
    projectenddate: string | null;
    projectstatus: string;
    projectdefault_teamno_fk: number | null;
    projectrestrictedind: string;
    projectcompanyname: string | null;
    projectcontacts: string | null;
    team_name: string | null;
    team_code: string | null;
    call_count: number;
    au_entryat: string;
}

interface Team {
    teamno_pk: number;
    teamname: string;
    teamcode: string;
}

interface Pagination {
    currentPage: number;
    totalPages: number;
    totalProjects: number;
    limit: number;
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<Pagination>({
        currentPage: 1,
        totalPages: 1,
        totalProjects: 0,
        limit: 10
    });

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [teamFilter, setTeamFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    const [formData, setFormData] = useState({
        projectcode: '',
        projectname: '',
        projectstartdate: '',
        projectenddate: '',
        projectstatus: 'OPEN',
        projectdefault_teamno_fk: null as number | null,
        projectrestrictedind: 'N',
        projectcompanyname: '',
        projectcontacts: '',
        au_orgno: 0
    });

    useEffect(() => {
        fetchProjects();
        fetchTeams();
    }, [currentPage, itemsPerPage, searchTerm, statusFilter, teamFilter]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await projectAPI.getAll({
                page: currentPage,
                limit: itemsPerPage,
                search: searchTerm,
                status: statusFilter,
                teamId: teamFilter ? parseInt(teamFilter) : undefined
            });

            if (response.success) {
                setProjects(response.data);
                if (response.pagination) {
                    setPagination(response.pagination);
                }
            }
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTeams = async () => {
        try {
            const response = await teamAPI.getAll({ limit: 1000 });
            if (response.success) {
                setTeams(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch teams:', error);
        }
    };

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handleStatusFilter = (value: string) => {
        setStatusFilter(value);
        setCurrentPage(1);
    };

    const handleTeamFilter = (value: string) => {
        setTeamFilter(value);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleOpenModal = (project: Project | null = null) => {
        if (project) {
            setEditingProject(project);
            setFormData({
                projectcode: project.projectcode || '',
                projectname: project.projectname,
                projectstartdate: project.projectstartdate ? new Date(project.projectstartdate).toISOString().split('T')[0] : '',
                projectenddate: project.projectenddate ? new Date(project.projectenddate).toISOString().split('T')[0] : '',
                projectstatus: project.projectstatus,
                projectdefault_teamno_fk: project.projectdefault_teamno_fk,
                projectrestrictedind: project.projectrestrictedind,
                projectcompanyname: project.projectcompanyname || '',
                projectcontacts: project.projectcontacts || '',
                au_orgno: 0
            });
        } else {
            setEditingProject(null);
            setFormData({
                projectcode: '',
                projectname: '',
                projectstartdate: '',
                projectenddate: '',
                projectstatus: 'OPEN',
                projectdefault_teamno_fk: null,
                projectrestrictedind: 'N',
                projectcompanyname: '',
                projectcontacts: '',
                au_orgno: 0
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProject(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const submitData = {
                ...formData,
                projectstartdate: formData.projectstartdate || null,
                projectenddate: formData.projectenddate || null
            };

            if (editingProject) {
                await projectAPI.update(editingProject.projectno_pk, submitData);
            } else {
                await projectAPI.create(submitData);
            }
            fetchProjects();
            handleCloseModal();
        } catch (error: any) {
            console.error('Failed to save project:', error);
            alert(error.message || 'Failed to save project');
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            try {
                await projectAPI.delete(id);
                fetchProjects();
            } catch (error) {
                console.error('Failed to delete project:', error);
                alert('Failed to delete project');
            }
        }
    };

    const getStatusBadgeColor = (status: string) => {
        const colors: Record<string, string> = {
            OPEN: 'bg-green-900 text-green-300',
            CLOSED: 'bg-red-900 text-red-300',
            HOLD: 'bg-yellow-900 text-yellow-300',
            PENDING: 'bg-blue-900 text-blue-300'
        };
        return colors[status] || 'bg-gray-900 text-gray-300';
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Continue';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>
                    <p className="text-sm text-gray-600">Manage projects and assign teams</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-gradient-to-r from-[#468847] to-[#9DC088] hover:opacity-90 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 shadow-md"
                >
                    <span>+</span> Create Project
                </button>
            </div>

            {/* Filters */}
            <div className="card mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <input
                            type="text"
                            placeholder="Search by name, code, company..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => handleStatusFilter(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                        >
                            <option value="">All Status</option>
                            <option value="OPEN">OPEN</option>
                            <option value="CLOSED">CLOSED</option>
                            <option value="HOLD">HOLD</option>
                            <option value="PENDING">PENDING</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
                        <select
                            value={teamFilter}
                            onChange={(e) => handleTeamFilter(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                        >
                            <option value="">All Teams</option>
                            {teams.map((team) => (
                                <option key={team.teamno_pk} value={team.teamno_pk}>
                                    {team.teamname}
                                </option>
                            ))}
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
                    <div className="p-8 text-center text-gray-600">Loading projects...</div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Code</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Project Name</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Company</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Team</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Duration</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Calls</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projects.map((project) => (
                                        <tr key={project.projectno_pk} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-4 text-gray-600">{project.projectcode || '-'}</td>
                                            <td className="py-4 px-4">
                                                <div className="font-medium text-gray-900">{project.projectname}</div>
                                                {project.projectrestrictedind === 'Y' && (
                                                    <span className="text-xs text-red-600">🔒 Restricted</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 text-gray-600">{project.projectcompanyname || '-'}</td>
                                            <td className="py-4 px-4">
                                                {project.team_name ? (
                                                    <div>
                                                        <div className="font-medium text-gray-900">{project.team_name}</div>
                                                        <div className="text-xs text-gray-500">{project.team_code}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">No team</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(project.projectstatus)}`}>
                                                    {project.projectstatus}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-sm text-gray-600">
                                                <div>{formatDate(project.projectstartdate)}</div>
                                                <div className="text-xs text-gray-400">to {formatDate(project.projectenddate)}</div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                                                    {project.call_count} calls
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-right space-x-2">
                                                <button
                                                    onClick={() => handleOpenModal(project)}
                                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(project.projectno_pk)}
                                                    className="text-red-600 hover:text-red-800 font-medium"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {projects.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                                No projects found. Create your first project!
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
                                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, pagination.totalProjects)}</span> of{' '}
                                    <span className="font-medium">{pagination.totalProjects}</span> projects
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

            {/* Create/Edit Project Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingProject ? 'Edit Project' : 'Create New Project'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Code</label>
                                    <input
                                        type="text"
                                        value={formData.projectcode}
                                        onChange={(e) => setFormData({ ...formData, projectcode: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                        placeholder="e.g., PROJ001"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.projectname}
                                        onChange={(e) => setFormData({ ...formData, projectname: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                        placeholder="Enter project name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                    <input
                                        type="text"
                                        value={formData.projectcompanyname}
                                        onChange={(e) => setFormData({ ...formData, projectcompanyname: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                        placeholder="Enter company name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Team</label>
                                    <select
                                        value={formData.projectdefault_teamno_fk || ''}
                                        onChange={(e) => setFormData({ ...formData, projectdefault_teamno_fk: e.target.value ? parseInt(e.target.value) : null })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                    >
                                        <option value="">Select team</option>
                                        {teams.map((team) => (
                                            <option key={team.teamno_pk} value={team.teamno_pk}>
                                                {team.teamname}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={formData.projectstartdate}
                                        onChange={(e) => setFormData({ ...formData, projectstartdate: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Leave blank for continue</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        value={formData.projectenddate}
                                        onChange={(e) => setFormData({ ...formData, projectenddate: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Leave blank for continue</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={formData.projectstatus}
                                        onChange={(e) => setFormData({ ...formData, projectstatus: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                    >
                                        <option value="OPEN">OPEN</option>
                                        <option value="CLOSED">CLOSED</option>
                                        <option value="HOLD">HOLD</option>
                                        <option value="PENDING">PENDING</option>
                                    </select>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="restricted"
                                        checked={formData.projectrestrictedind === 'Y'}
                                        onChange={(e) => setFormData({ ...formData, projectrestrictedind: e.target.checked ? 'Y' : 'N' })}
                                        className="w-4 h-4 rounded border-gray-300 text-[#468847] focus:ring-[#468847]"
                                    />
                                    <label htmlFor="restricted" className="ml-2 text-sm font-medium text-gray-700">
                                        Restricted Project
                                    </label>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contacts</label>
                                    <textarea
                                        value={formData.projectcontacts}
                                        onChange={(e) => setFormData({ ...formData, projectcontacts: e.target.value })}
                                        rows={3}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                        placeholder="Enter contact information"
                                    />
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
                                    {editingProject ? 'Update Project' : 'Create Project'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
