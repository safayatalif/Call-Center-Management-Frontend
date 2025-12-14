"use client";

import { useState, useEffect } from "react";
import { customerAPI, projectAPI } from "@/lib/api";
import * as XLSX from "xlsx";

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
  customer_type: string | null;
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
    limit: 10,
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelProjectId, setExcelProjectId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    custcode: "",
    projectno_fk: null as number | null,
    countrycode: "+880",
    custmobilenumber: "",
    custemail: "",
    custname: "",
    facebook_link: "",
    linkedin_link: "",
    other_link: "",
    call_link_type: "",
    text_note: "",
    contact_type: "",
    custarea: "",
    custfeedback: "",
    agentfeedback: "",
    never_callind: "N",
    never_callind_message: "",
    custgender: "",
    custbirthdate: "",
    custtype: "New",
    cust_labeling: "",
    au_orgno: 0,
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
        custtype: typeFilter,
      });

      if (response.success) {
        setCustomers(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
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
      console.error("Failed to fetch projects:", error);
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
        custcode: customer.custcode || "",
        projectno_fk: customer.projectno_fk,
        countrycode: customer.countrycode || "+880",
        custmobilenumber: customer.custmobilenumber || "",
        custemail: customer.custemail || "",
        custname: customer.custname || "",
        facebook_link: customer.facebook_link || "",
        linkedin_link: customer.linkedin_link || "",
        other_link: customer.other_link || "",
        call_link_type: customer.call_link_type || "",
        text_note: customer.text_note || "",
        contact_type: customer.contact_type || "",
        custarea: customer.custarea || "",
        custfeedback: customer.custfeedback || "",
        agentfeedback: customer.agentfeedback || "",
        never_callind: customer.never_callind || "N",
        never_callind_message: customer.never_callind_message || "",
        custgender: customer.custgender || "",
        custbirthdate: customer.custbirthdate || "",
        custtype: customer.custtype || "New",
        cust_labeling: customer.cust_labeling || "",
        au_orgno: 0,
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        custcode: "",
        projectno_fk: null,
        countrycode: "+880",
        custmobilenumber: "",
        custemail: "",
        custname: "",
        facebook_link: "",
        linkedin_link: "",
        other_link: "",
        call_link_type: "",
        text_note: "",
        contact_type: "",
        custarea: "",
        custfeedback: "",
        agentfeedback: "",
        never_callind: "N",
        never_callind_message: "",
        custgender: "",
        custbirthdate: "",
        custtype: "New",
        cust_labeling: "",
        au_orgno: 0,
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
      console.error("Failed to save customer:", error);
      alert(error.message || "Failed to save customer");
    }
  };

  const handleDelete = async (id: number) => {
    if (
      confirm(
        "Are you sure you want to delete this customer? This action cannot be undone."
      )
    ) {
      try {
        await customerAPI.delete(id);
        fetchCustomers();
      } catch (error) {
        console.error("Failed to delete customer:", error);
        alert("Failed to delete customer");
      }
    }
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelFile(file);
  };

  const handleExcelSubmit = async () => {
    if (!excelFile || !excelProjectId) {
      alert("Please select a file and a project");
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = event.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

          // Create customers from Excel data
          for (const row of jsonData) {
            const customerData = {
              custcode: row.custcode || row["Customer Code"] || "",
              projectno_fk: excelProjectId,
              countrycode: row.countrycode || row["Country Code"] || "+880",
              custmobilenumber:
                row.custmobilenumber || row["Mobile Number"] || "",
              custemail: row.custemail || row["Email"] || "",
              custname: row.custname || row["Customer Name"] || "",
              facebook_link: row.facebook_link || row["Facebook"] || "",
              linkedin_link: row.linkedin_link || row["LinkedIn"] || "",
              other_link: row.other_link || row["Other Link"] || "",
              call_link_type: row.call_link_type || row["Link Type"] || "",
              text_note: row.text_note || row["Note"] || "",
              contact_type: row.contact_type || row["Contact Type"] || "",
              custarea: row.custarea || row["Area"] || "",
              custfeedback: row.custfeedback || row["Customer Feedback"] || "",
              agentfeedback: row.agentfeedback || row["Agent Feedback"] || "",
              never_callind:
                row.never_callind || row["Do Not Call"] === "Y" ? "Y" : "N",
              never_callind_message:
                row.never_callind_message || row["Do Not Call Message"] || "",
              custgender: row.custgender || row["Gender"] || "",
              custbirthdate: row.custbirthdate || row["Birth Date"] || "",
              custtype: row.custtype || row["Type"] || row.customer_type || row["Customer Type"] || "New",
              cust_labeling: row.cust_labeling || row["Label"] || "",
              au_orgno: 0,
            };

            await customerAPI.create(customerData);
          }

          alert(`Successfully created ${jsonData.length} customers from Excel`);
          fetchCustomers();
          setIsExcelModalOpen(false);
          setExcelFile(null);
          setExcelProjectId(null);
        } catch (error: any) {
          console.error("Error processing Excel:", error);
          alert("Error processing Excel file: " + error.message);
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsBinaryString(excelFile);
    } catch (error: any) {
      console.error("Failed to upload Excel:", error);
      alert("Failed to upload Excel: " + error.message);
      setIsUploading(false);
    }
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      Undefined: "bg-gray-100 text-gray-700",
      New: "bg-green-100 text-green-700",
      Regular: "bg-blue-100 text-blue-700",
      Reorder: "bg-purple-100 text-purple-700",
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Customer Management
          </h1>
          <p className="text-sm text-gray-600">
            Manage customers and project assignments
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleOpenModal()}
            className="bg-gradient-to-r from-[#468847] to-[#9DC088] hover:opacity-90 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 shadow-md"
          >
            <span>+</span> Create Customer
          </button>
          <button
            onClick={() => setIsExcelModalOpen(true)}
            disabled={!projectFilter}
            className={`${projectFilter
              ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
              } px-4 py-2 rounded-lg transition-all flex items-center gap-2 shadow-md`}
          >
            <span>📊</span> Excel Upload
          </button>
        </div>
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
              placeholder="Search by name, code, mobile..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Type
            </label>
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
            Loading customers...
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
                      Customer Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Contact Info
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Project
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Links
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer, index) => (
                    <tr
                      key={customer.custno_pk}
                      className="border-b border-gray-100"
                      style={{
                        backgroundColor:
                          index % 2 === 0 ? "#f2f4f8" : "#f9fafc",
                      }}
                    >
                      <td className="py-4 px-4 text-gray-600">
                        {customer.custcode || "-"}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">
                          {customer.custname || "Unknown"}
                        </div>
                        {customer.never_callind === "Y" && (
                          <span className="text-xs text-red-600 font-bold">
                            🚫 DO NOT CALL
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900">
                          {customer.custmobilenumber || "-"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {customer.custemail || ""}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {customer.project_name ? (
                          <div>
                            <div className="font-medium text-gray-900">
                              {customer.project_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {customer.project_code}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">No project</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold whitespace-nowrap ${getTypeBadgeColor(
                            customer.custtype
                          )}`}
                        >
                          {customer.custtype || "Unknown"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          {customer.facebook_link && (
                            <a
                              href={customer.facebook_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-800 transition-colors"
                              title="Facebook Profile"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                              </svg>
                            </a>
                          )}
                          {customer.linkedin_link && (
                            <a
                              href={customer.linkedin_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-900 transition-colors"
                              title="LinkedIn Profile"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenModal(customer)}
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
                          onClick={() => handleDelete(customer.custno_pk)}
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
                  {customers.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-8 text-center text-gray-500"
                      >
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
                  Showing{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      currentPage * itemsPerPage,
                      pagination.totalCustomers
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">
                    {pagination.totalCustomers}
                  </span>{" "}
                  customers
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

      {/* Create/Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCustomer ? "Edit Customer" : "Create New Customer"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Basic Info */}
                <div className="md:col-span-3">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                    Basic Information
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Code
                  </label>
                  <input
                    type="text"
                    value={formData.custcode}
                    onChange={(e) =>
                      setFormData({ ...formData, custcode: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                    placeholder="e.g., CUST001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={formData.custname}
                    onChange={(e) =>
                      setFormData({ ...formData, custname: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                    placeholder="Enter name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned Project
                  </label>
                  <select
                    value={formData.projectno_fk || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        projectno_fk: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                  >
                    <option value="">Select project</option>
                    {projects.map((project) => (
                      <option
                        key={project.projectno_pk}
                        value={project.projectno_pk}
                      >
                        {project.projectname}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Contact Info */}
                <div className="md:col-span-3 mt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                    Contact Details
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    value={formData.custmobilenumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        custmobilenumber: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                    placeholder="Enter mobile number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.custemail}
                    onChange={(e) =>
                      setFormData({ ...formData, custemail: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                    placeholder="Enter email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Area
                  </label>
                  <input
                    type="text"
                    value={formData.custarea}
                    onChange={(e) =>
                      setFormData({ ...formData, custarea: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                    placeholder="Enter area"
                  />
                </div>

                {/* Social Links */}
                <div className="md:col-span-3 mt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                    Social Links
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Facebook Link
                  </label>
                  <input
                    type="text"
                    value={formData.facebook_link}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        facebook_link: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                    placeholder="Facebook URL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LinkedIn Link
                  </label>
                  <input
                    type="text"
                    value={formData.linkedin_link}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        linkedin_link: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                    placeholder="LinkedIn URL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Other Link
                  </label>
                  <input
                    type="text"
                    value={formData.other_link}
                    onChange={(e) =>
                      setFormData({ ...formData, other_link: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                    placeholder="Other URL"
                  />
                </div>

                {/* Additional Info */}
                <div className="md:col-span-3 mt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                    Additional Information
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Type
                  </label>
                  <select
                    value={formData.custtype}
                    onChange={(e) =>
                      setFormData({ ...formData, custtype: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                  >
                    <option value="Undefined">Undefined</option>
                    <option value="New">New</option>
                    <option value="Regular">Regular</option>
                    <option value="Reorder">Reorder</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.custgender}
                    onChange={(e) =>
                      setFormData({ ...formData, custgender: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Birth Date
                  </label>
                  <input
                    type="date"
                    value={formData.custbirthdate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        custbirthdate: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Call Link Types
                  </label>
                  <input
                    type="text"
                    value={formData.call_link_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        call_link_type: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                    placeholder="e.g., Mobile, Facebook, WhatsApp (comma separated)"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Text Note
                  </label>
                  <textarea
                    value={formData.text_note}
                    onChange={(e) =>
                      setFormData({ ...formData, text_note: e.target.value })
                    }
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                    placeholder="Internal notes"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Feedback
                  </label>
                  <textarea
                    value={formData.custfeedback}
                    onChange={(e) =>
                      setFormData({ ...formData, custfeedback: e.target.value })
                    }
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
                    placeholder="Feedback from customer"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Agent Feedback
                  </label>
                  <textarea
                    value={formData.agentfeedback}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        agentfeedback: e.target.value,
                      })
                    }
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
                      checked={formData.never_callind === "Y"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          never_callind: e.target.checked ? "Y" : "N",
                        })
                      }
                      className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <label
                      htmlFor="never_call"
                      className="ml-2 text-sm font-bold text-red-700"
                    >
                      NEVER CALL INDICATOR
                    </label>
                  </div>
                  {formData.never_callind === "Y" && (
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reason / Message
                      </label>
                      <input
                        type="text"
                        value={formData.never_callind_message}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            never_callind_message: e.target.value,
                          })
                        }
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
                  {editingCustomer ? "Update Customer" : "Create Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Excel Upload Modal */}
      {isExcelModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                📊 Upload Customer Excel
              </h2>
              <button
                onClick={() => {
                  setIsExcelModalOpen(false);
                  setExcelFile(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Project
                </label>
                <select
                  value={excelProjectId || ""}
                  onChange={(e) =>
                    setExcelProjectId(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Select a Project --</option>
                  {projects.map((project) => (
                    <option
                      key={project.projectno_pk}
                      value={project.projectno_pk}
                    >
                      {project.projectname}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excel File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleExcelUpload}
                    className="hidden"
                    id="excel-file-input"
                    disabled={isUploading}
                  />
                  <label htmlFor="excel-file-input" className="cursor-pointer">
                    <div className="text-4xl mb-2">📁</div>
                    <p className="text-sm text-gray-600">
                      {excelFile
                        ? excelFile.name
                        : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      XLSX, XLS, or CSV files
                    </p>
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>📋 Excel Format:</strong> Your file should have
                  columns like: custcode, custname, custmobilenumber, custemail,
                  custtype, etc.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsExcelModalOpen(false);
                  setExcelFile(null);
                  setExcelProjectId(null);
                }}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                onClick={handleExcelSubmit}
                disabled={!excelFile || !excelProjectId || isUploading}
                className={`${!excelFile || !excelProjectId || isUploading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 text-white"
                  } px-6 py-2 rounded-lg transition-all shadow-md font-medium`}
              >
                {isUploading ? "Uploading..." : "Upload Customers"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
