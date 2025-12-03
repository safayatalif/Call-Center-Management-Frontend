'use client';

import { useState, useEffect } from 'react';
import { assignmentAPI, projectAPI } from '@/lib/api';

interface Project {
    projectno_pk: number;
    projectname: string;
    projectcode: string;
}

interface Employee {
    empno_pk: number;
    empcode: string;
    name: string;
    emailidoffical: string;
    role: string;
}

interface Customer {
    custno_pk: number;
    custcode: string;
    custname: string;
    custmobilenumber: string;
    custemail: string;
    custtype: string;
    is_assigned: boolean;
    assigned_to_empno: number | null;
    assigned_to_name: string | null;
}

export default function CustomerAssignPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<number | null>(null);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
    const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    // Assignment form data
    const [assignmentData, setAssignmentData] = useState({
        calltargetdate: '',
        callpriority: 'Low'
    });

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        if (selectedProject) {
            fetchProjectData();
        }
    }, [selectedProject]);

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

    const fetchProjectData = async () => {
        if (!selectedProject) return;

        try {
            setLoading(true);
            const response = await assignmentAPI.getProjectData(selectedProject);
            if (response.success) {
                setEmployees(response.data.employees);
                setCustomers(response.data.customers);
            }
        } catch (error) {
            console.error('Failed to fetch project data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProjectChange = (projectId: string) => {
        const id = projectId ? parseInt(projectId) : null;
        setSelectedProject(id);
        setSelectedEmployee(null);
        setSelectedCustomers([]);
        setEmployees([]);
        setCustomers([]);
    };

    const handleEmployeeChange = (empId: string) => {
        const id = empId ? parseInt(empId) : null;
        setSelectedEmployee(id);
        setSelectedCustomers([]);
    };

    const handleCustomerToggle = (custId: number) => {
        setSelectedCustomers(prev => {
            if (prev.includes(custId)) {
                return prev.filter(id => id !== custId);
            } else {
                return [...prev, custId];
            }
        });
    };

    const handleSelectAll = () => {
        const unassignedCustomers = customers.filter(c => !c.is_assigned);
        const allIds = unassignedCustomers.map(c => c.custno_pk);
        setSelectedCustomers(allIds);
    };

    const handleDeselectAll = () => {
        setSelectedCustomers([]);
    };

    const handleAssign = async () => {
        if (!selectedEmployee || selectedCustomers.length === 0) {
            alert('Please select an employee and at least one customer');
            return;
        }

        try {
            setLoading(true);
            const response = await assignmentAPI.assignCustomers({
                empno_pk: selectedEmployee,
                customer_ids: selectedCustomers,
                calltargetdate: assignmentData.calltargetdate || null,
                callpriority: assignmentData.callpriority
            });

            if (response.success) {
                alert(`Successfully assigned ${selectedCustomers.length} customer(s)`);
                setSelectedCustomers([]);
                fetchProjectData(); // Refresh data
            }
        } catch (error: any) {
            console.error('Failed to assign customers:', error);
            alert(error.message || 'Failed to assign customers');
        } finally {
            setLoading(false);
        }
    };

    const getUnassignedCustomers = () => {
        return customers.filter(c => !c.is_assigned);
    };

    const getAssignedCustomers = () => {
        return customers.filter(c => c.is_assigned);
    };

    const getCustomersByEmployee = (empId: number) => {
        return customers.filter(c => c.assigned_to_empno === empId);
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Customer Assignment</h1>
                <p className="text-sm text-gray-600">Assign customers to employees based on project</p>
            </div>

            {/* Step 1: Select Project */}
            <div className="card mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 1: Select Project</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project *</label>
                        <select
                            value={selectedProject || ''}
                            onChange={(e) => handleProjectChange(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                        >
                            <option value="">Select a project</option>
                            {projects.map((project) => (
                                <option key={project.projectno_pk} value={project.projectno_pk}>
                                    {project.projectname} ({project.projectcode})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {selectedProject && (
                <>
                    {/* Step 2: Select Employee */}
                    <div className="card mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 2: Select Employee</h2>
                        {loading ? (
                            <div className="text-center py-4 text-gray-600">Loading employees...</div>
                        ) : employees.length === 0 ? (
                            <div className="text-center py-4 text-gray-500">
                                No employees found in this project's team
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
                                    <select
                                        value={selectedEmployee || ''}
                                        onChange={(e) => handleEmployeeChange(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                    >
                                        <option value="">Select an employee</option>
                                        {employees.map((emp) => (
                                            <option key={emp.empno_pk} value={emp.empno_pk}>
                                                {emp.name} - {emp.role} ({emp.empcode})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Show currently assigned customers for selected employee */}
                        {selectedEmployee && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                                    Currently Assigned Customers ({getCustomersByEmployee(selectedEmployee).length})
                                </h3>
                                {getCustomersByEmployee(selectedEmployee).length === 0 ? (
                                    <p className="text-sm text-blue-700">No customers assigned yet</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {getCustomersByEmployee(selectedEmployee).map((customer) => (
                                            <div key={customer.custno_pk} className="text-sm text-blue-800">
                                                • {customer.custname} ({customer.custmobilenumber})
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Step 3: Select Customers & Assign */}
                    {selectedEmployee && (
                        <div className="card mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Step 3: Select Customers to Assign</h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSelectAll}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Select All
                                    </button>
                                    <button
                                        onClick={handleDeselectAll}
                                        className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                                    >
                                        Deselect All
                                    </button>
                                </div>
                            </div>

                            {/* Assignment Settings */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Call Target Date</label>
                                    <input
                                        type="date"
                                        value={assignmentData.calltargetdate}
                                        onChange={(e) => setAssignmentData({ ...assignmentData, calltargetdate: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Call Priority</label>
                                    <select
                                        value={assignmentData.callpriority}
                                        onChange={(e) => setAssignmentData({ ...assignmentData, callpriority: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                            </div>

                            {/* Customer List */}
                            {getUnassignedCustomers().length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    All customers are already assigned
                                </div>
                            ) : (
                                <>
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600">
                                            Selected: <span className="font-semibold text-gray-900">{selectedCustomers.length}</span> customer(s)
                                        </p>
                                    </div>

                                    <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 sticky top-0">
                                                <tr>
                                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 w-12">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedCustomers.length === getUnassignedCustomers().length && getUnassignedCustomers().length > 0}
                                                            onChange={(e) => e.target.checked ? handleSelectAll() : handleDeselectAll()}
                                                            className="w-4 h-4 rounded border-gray-300 text-[#468847] focus:ring-[#468847]"
                                                        />
                                                    </th>
                                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Code</th>
                                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer Name</th>
                                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Mobile</th>
                                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {getUnassignedCustomers().map((customer) => (
                                                    <tr key={customer.custno_pk} className="border-b border-gray-100 hover:bg-gray-50">
                                                        <td className="py-3 px-4">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedCustomers.includes(customer.custno_pk)}
                                                                onChange={() => handleCustomerToggle(customer.custno_pk)}
                                                                className="w-4 h-4 rounded border-gray-300 text-[#468847] focus:ring-[#468847]"
                                                            />
                                                        </td>
                                                        <td className="py-3 px-4 text-sm text-gray-600">{customer.custcode || '-'}</td>
                                                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{customer.custname}</td>
                                                        <td className="py-3 px-4 text-sm text-gray-600">{customer.custmobilenumber || '-'}</td>
                                                        <td className="py-3 px-4">
                                                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-900 text-gray-300">
                                                                {customer.custtype}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="mt-4 flex justify-end">
                                        <button
                                            onClick={handleAssign}
                                            disabled={selectedCustomers.length === 0 || loading}
                                            className="bg-gradient-to-r from-[#468847] to-[#9DC088] hover:opacity-90 text-white px-6 py-2 rounded-lg transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? 'Assigning...' : `Assign ${selectedCustomers.length} Customer(s)`}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Summary of All Assignments */}
                    {customers.length > 0 && (
                        <div className="card">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Assignment Summary</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-900">{customers.length}</div>
                                    <div className="text-sm text-blue-700">Total Customers</div>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-900">{getAssignedCustomers().length}</div>
                                    <div className="text-sm text-green-700">Assigned</div>
                                </div>
                                <div className="p-4 bg-orange-50 rounded-lg">
                                    <div className="text-2xl font-bold text-orange-900">{getUnassignedCustomers().length}</div>
                                    <div className="text-sm text-orange-700">Unassigned</div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
