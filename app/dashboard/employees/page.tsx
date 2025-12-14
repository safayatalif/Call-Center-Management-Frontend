"use client";

import { useState, useEffect } from "react";
import { employeeAPI } from "@/lib/api";

interface Employee {
  empno_pk: number;
  empcode: string | null;
  joindate: string | null;
  name: string;
  role: "ADMIN" | "MANAGER" | "AGENT" | "TRAINEE";
  capacity: number;
  officialmobilenum: string | null;
  personalmobilenum: string | null;
  socialmediaidofficial: string | null;
  emailidoffical: string;
  address: string | null;
  empremarks: string | null;
  empstatus: string;
  restricteddataprivilege: string;
  app_userind: string | null;
  username: string;
  au_entryat: string;
  assigned_project_id: number | null;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalEmployees: number;
  limit: number;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalEmployees: 0,
    limit: 10,
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    empcode: "",
    joindate: new Date().toISOString().split("T")[0],
    name: "",
    role: "AGENT" as "ADMIN" | "MANAGER" | "AGENT" | "TRAINEE",
    capacity: 0,
    officialmobilenum: "",
    personalmobilenum: "",
    socialmediaidofficial: "",
    emailidoffical: "",
    address: "",
    empremarks: "",
    empstatus: "Active",
    restricteddataprivilege: "N",
    app_userind: "",
    username: "",
    entrypass: "",
    au_orgno: 0,
    assigned_project_id: null as number | null,
  });

  useEffect(() => {
    fetchEmployees();
  }, [currentPage, itemsPerPage, searchTerm, roleFilter, statusFilter]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getAll({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        role: roleFilter,
        status: statusFilter,
      });

      if (response.success) {
        setEmployees(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
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

  const handleOpenModal = (employee: Employee | null = null) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        empcode: employee.empcode || "",
        joindate: employee.joindate
          ? new Date(employee.joindate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        name: employee.name,
        role: employee.role,
        capacity: employee.capacity,
        officialmobilenum: employee.officialmobilenum || "",
        personalmobilenum: employee.personalmobilenum || "",
        socialmediaidofficial: employee.socialmediaidofficial || "",
        emailidoffical: employee.emailidoffical,
        address: employee.address || "",
        empremarks: employee.empremarks || "",
        empstatus: employee.empstatus,
        restricteddataprivilege: employee.restricteddataprivilege,
        app_userind: employee.app_userind || "",
        username: employee.username,
        entrypass: "",
        au_orgno: 0,
        assigned_project_id: employee.assigned_project_id,
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        empcode: "",
        joindate: new Date().toISOString().split("T")[0],
        name: "",
        role: "AGENT",
        capacity: 0,
        officialmobilenum: "",
        personalmobilenum: "",
        socialmediaidofficial: "",
        emailidoffical: "",
        address: "",
        empremarks: "",
        empstatus: "Active",
        restricteddataprivilege: "N",
        app_userind: "",
        username: "",
        entrypass: "",
        au_orgno: 0,
        assigned_project_id: null,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = { ...formData };
      if (editingEmployee && !submitData.entrypass) {
        delete (submitData as any).entrypass;
      }

      if (editingEmployee) {
        await employeeAPI.update(editingEmployee.empno_pk, submitData);
      } else {
        await employeeAPI.create(submitData);
      }
      fetchEmployees();
      handleCloseModal();
    } catch (error: any) {
      console.error("Failed to save employee:", error);
      alert(error.message || "Failed to save employee");
    }
  };

  const handleDelete = async (id: number) => {
    if (
      confirm(
        "Are you sure you want to permanently delete this employee? This action cannot be undone."
      )
    ) {
      try {
        await employeeAPI.delete(id);
        fetchEmployees();
      } catch (error) {
        console.error("Failed to delete employee:", error);
        alert("Failed to delete employee");
      }
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: "bg-red-100 text-red-700 border border-red-200",
      MANAGER: "bg-purple-100 text-purple-700 border border-purple-200",
      AGENT: "bg-blue-100 text-blue-700 border border-blue-200",
      TRAINEE: "bg-amber-100 text-amber-700 border border-amber-200",
    };
    return colors[role] || "bg-gray-100 text-gray-700 border border-gray-200";
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      Active: "bg-green-100 text-green-700 border border-green-200",
      Inactive: "bg-yellow-100 text-yellow-700 border border-yellow-200",
      Closed: "bg-red-100 text-red-700 border border-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-700 border border-gray-200";
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Employee Management
          </h1>
          <p className="text-sm text-gray-600">
            Manage employees and their information
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-gradient-to-r from-[#468847] to-[#9DC088] hover:opacity-90 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 shadow-md"
        >
          <span>+</span> Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name, email, code..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Per Page
            </label>
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
          <div className="p-8 text-center text-gray-600">
            Loading employees...
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Code
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Role
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Contact
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee, index) => (
                    <tr
                      key={employee.empno_pk}
                      className="border-b border-gray-100"
                      style={{
                        backgroundColor:
                          index % 2 === 0 ? "#f2f4f8" : "#f9fafc",
                      }}
                    >
                      <td className="py-4 px-4 text-gray-600">
                        {employee.empcode || "-"}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">
                          {employee.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {employee.username}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {employee.emailidoffical}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(
                            employee.role
                          )}`}
                        >
                          {employee.role}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                            employee.empstatus
                          )}`}
                        >
                          {employee.empstatus}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {employee.officialmobilenum ||
                          employee.personalmobilenum ||
                          "-"}
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenModal(employee)}
                          className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-800 transition-colors"
                          title="Edit"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(employee.empno_pk)}
                          className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-800 transition-colors"
                          title="Delete"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {employees.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No employees found. Try adjusting your filters.
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
                  Showing{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      currentPage * itemsPerPage,
                      pagination.totalEmployees
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">
                    {pagination.totalEmployees}
                  </span>{" "}
                  employees
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
                          className={`px-3 py-1 border rounded-lg text-sm font-medium ${
                            currentPage === page
                              ? "bg-[#468847] text-white border-[#468847]"
                              : "border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="px-2">
                          ...
                        </span>
                      );
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">
                {editingEmployee ? "Edit Employee" : "Create New Employee"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee Code
                    </label>
                    <input
                      type="text"
                      value={formData.empcode}
                      onChange={(e) =>
                        setFormData({ ...formData, empcode: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Join Date
                    </label>
                    <input
                      type="date"
                      value={formData.joindate}
                      onChange={(e) =>
                        setFormData({ ...formData, joindate: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.emailidoffical}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emailidoffical: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password{" "}
                      {editingEmployee ? "(leave blank to keep current)" : "*"}
                    </label>
                    <input
                      type="password"
                      required={!editingEmployee}
                      value={formData.entrypass}
                      onChange={(e) =>
                        setFormData({ ...formData, entrypass: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          role: e.target.value as any,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="MANAGER">MANAGER</option>
                      <option value="AGENT">AGENT</option>
                      <option value="TRAINEE">TRAINEE</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Capacity
                    </label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          capacity: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.empstatus}
                      onChange={(e) =>
                        setFormData({ ...formData, empstatus: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Official Mobile
                    </label>
                    <input
                      type="text"
                      value={formData.officialmobilenum}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          officialmobilenum: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Personal Mobile
                    </label>
                    <input
                      type="text"
                      value={formData.personalmobilenum}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          personalmobilenum: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      rows={2}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Additional Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Social Media IDs (Official)
                    </label>
                    <textarea
                      value={formData.socialmediaidofficial}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          socialmediaidofficial: e.target.value,
                        })
                      }
                      rows={2}
                      placeholder="Facebook, WhatsApp, Telegram, etc."
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Remarks
                    </label>
                    <textarea
                      value={formData.empremarks}
                      onChange={(e) =>
                        setFormData({ ...formData, empremarks: e.target.value })
                      }
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="restricted_data_privilege"
                      checked={formData.restricteddataprivilege === "Y"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          restricteddataprivilege: e.target.checked ? "Y" : "N",
                        })
                      }
                      className="w-4 h-4 rounded border-gray-300 text-[#468847] focus:ring-[#468847]"
                    />
                    <label
                      htmlFor="restricted_data_privilege"
                      className="text-sm font-medium text-gray-700"
                    >
                      Restricted Data Privilege
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
                  {editingEmployee ? "Update Employee" : "Create Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
