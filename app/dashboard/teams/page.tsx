"use client";

import { useState, useEffect } from "react";
import { teamAPI, employeeAPI } from "@/lib/api";

interface Team {
  teamno_pk: number;
  teamcode: string | null;
  teamname: string;
  teamdescription: string | null;
  teamtype: string | null;
  teamlead_empno_fk: number | null;
  teamlead_name: string | null;
  teamlead_email: string | null;
  member_count: number;
  au_entryat: string;
}

interface TeamMember {
  teamdtlno_pk: number;
  team_empno_pk: number;
  employee_name: string;
  employee_email: string;
  employee_role: string;
  employee_code: string;
  remarks: string | null;
}

interface Employee {
  empno_pk: number;
  empcode: string;
  name: string;
  emailidoffical: string;
  role: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalTeams: number;
  limit: number;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalTeams: 0,
    limit: 10,
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [teamTypeFilter, setTeamTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);

  const [formData, setFormData] = useState({
    teamcode: "",
    teamname: "",
    teamdescription: "",
    teamtype: "",
    teamlead_empno_fk: null as number | null,
    au_orgno: 0,
  });

  useEffect(() => {
    fetchTeams();
    fetchAllEmployees();
  }, [currentPage, itemsPerPage, searchTerm, teamTypeFilter]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await teamAPI.getAll({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        teamtype: teamTypeFilter,
      });

      if (response.success) {
        setTeams(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (error) {
      console.error("Failed to fetch teams:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllEmployees = async () => {
    try {
      const response = await employeeAPI.getAll({ limit: 1000 });
      if (response.success) {
        setAllEmployees(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleTeamTypeFilter = (value: string) => {
    setTeamTypeFilter(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleOpenModal = (team: Team | null = null) => {
    if (team) {
      setEditingTeam(team);
      setFormData({
        teamcode: team.teamcode || "",
        teamname: team.teamname,
        teamdescription: team.teamdescription || "",
        teamtype: team.teamtype || "",
        teamlead_empno_fk: team.teamlead_empno_fk,
        au_orgno: 0,
      });
    } else {
      setEditingTeam(null);
      setFormData({
        teamcode: "",
        teamname: "",
        teamdescription: "",
        teamtype: "",
        teamlead_empno_fk: null,
        au_orgno: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTeam(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTeam) {
        await teamAPI.update(editingTeam.teamno_pk, formData);
      } else {
        await teamAPI.create(formData);
      }
      fetchTeams();
      handleCloseModal();
    } catch (error: any) {
      console.error("Failed to save team:", error);
      alert(error.message || "Failed to save team");
    }
  };

  const handleDelete = async (id: number) => {
    if (
      confirm(
        "Are you sure you want to delete this team? This will also remove all team members."
      )
    ) {
      try {
        await teamAPI.delete(id);
        fetchTeams();
      } catch (error) {
        console.error("Failed to delete team:", error);
        alert("Failed to delete team");
      }
    }
  };

  const handleManageMembers = async (team: Team) => {
    try {
      const response = await teamAPI.getById(team.teamno_pk);
      if (response.success) {
        setSelectedTeam(response.data);
        setTeamMembers(response.data.members || []);
        await fetchAvailableEmployees(team.teamno_pk);
        setIsMemberModalOpen(true);
      }
    } catch (error) {
      console.error("Failed to fetch team details:", error);
    }
  };

  const fetchAvailableEmployees = async (
    teamId: number,
    search: string = ""
  ) => {
    try {
      const response = await teamAPI.getAvailableEmployees(teamId, search);
      if (response.success) {
        setAvailableEmployees(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch available employees:", error);
    }
  };

  const handleAddMember = async (employeeId: number) => {
    if (!selectedTeam) return;
    try {
      await teamAPI.addMember(selectedTeam.teamno_pk, employeeId);
      // Refresh team details
      const response = await teamAPI.getById(selectedTeam.teamno_pk);
      if (response.success) {
        setTeamMembers(response.data.members || []);
        await fetchAvailableEmployees(selectedTeam.teamno_pk, employeeSearch);
      }
      fetchTeams(); // Refresh team list to update member count
    } catch (error: any) {
      console.error("Failed to add member:", error);
      alert(error.message || "Failed to add member");
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!selectedTeam) return;
    if (confirm("Are you sure you want to remove this member from the team?")) {
      try {
        await teamAPI.removeMember(selectedTeam.teamno_pk, memberId);
        // Refresh team details
        const response = await teamAPI.getById(selectedTeam.teamno_pk);
        if (response.success) {
          setTeamMembers(response.data.members || []);
          await fetchAvailableEmployees(selectedTeam.teamno_pk, employeeSearch);
        }
        fetchTeams(); // Refresh team list to update member count
      } catch (error) {
        console.error("Failed to remove member:", error);
        alert("Failed to remove member");
      }
    }
  };

  const getTeamTypeBadgeColor = (type: string | null) => {
    const colors: Record<string, string> = {
      "Page Moderator": "bg-blue-900 text-blue-300",
      "Re-Order": "bg-green-900 text-green-300",
      Corporate: "bg-purple-900 text-purple-300",
      "Company Wise": "bg-orange-900 text-orange-300",
    };
    return type
      ? colors[type] || "bg-gray-900 text-gray-300"
      : "bg-gray-900 text-gray-300";
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-sm text-gray-600">
            Create and manage teams with members
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-gradient-to-r from-[#468847] to-[#9DC088] hover:opacity-90 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 shadow-md"
        >
          <span>+</span> Create Team
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name, code, description..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Type
            </label>
            <select
              value={teamTypeFilter}
              onChange={(e) => handleTeamTypeFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
            >
              <option value="">All Types</option>
              <option value="Page Moderator">Page Moderator</option>
              <option value="Re-Order">Re-Order</option>
              <option value="Corporate">Corporate</option>
              <option value="Company Wise">Company Wise</option>
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
          <div className="p-8 text-center text-gray-600">Loading teams...</div>
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
                      Team Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Team Leader
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Members
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Description
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team, index) => (
                    <tr
                      key={team.teamno_pk}
                      className="border-b border-gray-100"
                      style={{
                        backgroundColor:
                          index % 2 === 0 ? "#f2f4f8" : "#f9fafc",
                      }}
                    >
                      <td className="py-4 px-4 text-gray-600">
                        {team.teamcode || "-"}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">
                          {team.teamname}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {team.teamtype ? (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getTeamTypeBadgeColor(
                              team.teamtype
                            )}`}
                          >
                            {team.teamtype}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {team.teamlead_name ? (
                          <div>
                            <div className="font-medium text-gray-900">
                              {team.teamlead_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {team.teamlead_email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">No leader</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                          {team.member_count} members
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600 max-w-xs truncate">
                        {team.teamdescription || "-"}
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleManageMembers(team)}
                          className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 hover:text-green-800 transition-colors"
                          title="Add Members"
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
                              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleOpenModal(team)}
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
                          onClick={() => handleDelete(team.teamno_pk)}
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
                  {teams.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No teams found. Create your first team!
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
                      pagination.totalTeams
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">{pagination.totalTeams}</span>{" "}
                  teams
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

      {/* Create/Edit Team Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">
                {editingTeam ? "Edit Team" : "Create New Team"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Code
                  </label>
                  <input
                    type="text"
                    value={formData.teamcode}
                    onChange={(e) =>
                      setFormData({ ...formData, teamcode: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                    placeholder="e.g., TEAM001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.teamname}
                    onChange={(e) =>
                      setFormData({ ...formData, teamname: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                    placeholder="Enter team name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Type
                  </label>
                  <select
                    value={formData.teamtype}
                    onChange={(e) =>
                      setFormData({ ...formData, teamtype: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                  >
                    <option value="">Select type</option>
                    <option value="Page Moderator">Page Moderator</option>
                    <option value="Re-Order">Re-Order</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Company Wise">Company Wise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Leader
                  </label>
                  <select
                    value={formData.teamlead_empno_fk || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        teamlead_empno_fk: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                  >
                    <option value="">Select team leader</option>
                    {allEmployees.map((emp) => (
                      <option key={emp.empno_pk} value={emp.empno_pk}>
                        {emp.name} ({emp.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.teamdescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        teamdescription: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                    placeholder="Enter team description"
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
                  {editingTeam ? "Update Team" : "Create Team"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Members Modal */}
      {isMemberModalOpen && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Manage Team Members
                </h2>
                <p className="text-sm text-gray-600">{selectedTeam.teamname}</p>
              </div>
              <button
                onClick={() => setIsMemberModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Members */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Current Members ({teamMembers.length})
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {teamMembers.length === 0 ? (
                      <p className="text-gray-500 text-sm">
                        No members yet. Add members from the right panel.
                      </p>
                    ) : (
                      teamMembers.map((member) => (
                        <div
                          key={member.teamdtlno_pk}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {member.employee_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {member.employee_email}
                            </div>
                            <div className="text-xs text-gray-400">
                              {member.employee_code} • {member.employee_role}
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              handleRemoveMember(member.teamdtlno_pk)
                            }
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Available Employees */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Add Members
                  </h3>
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={employeeSearch}
                    onChange={(e) => {
                      setEmployeeSearch(e.target.value);
                      fetchAvailableEmployees(
                        selectedTeam.teamno_pk,
                        e.target.value
                      );
                    }}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:border-[#468847]"
                  />
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {availableEmployees.length === 0 ? (
                      <p className="text-gray-500 text-sm">
                        No available employees found.
                      </p>
                    ) : (
                      availableEmployees.map((employee) => (
                        <div
                          key={employee.empno_pk}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {employee.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {employee.emailidoffical}
                            </div>
                            <div className="text-xs text-gray-400">
                              {employee.empcode} • {employee.role}
                            </div>
                          </div>
                          <button
                            onClick={() => handleAddMember(employee.empno_pk)}
                            className="bg-[#468847] hover:opacity-90 text-white px-3 py-1 rounded text-sm font-medium"
                          >
                            Add
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
