"use client";

import { useState, useEffect } from "react";
import { reportsAPI } from "@/lib/api";

// Function to export data to Excel
const exportToExcel = (
  data: any[],
  filename: string,
  columns: string[],
  headers: string[]
) => {
  let csvContent = "data:text/csv;charset=utf-8,";

  // Add headers
  csvContent += headers.join(",") + "\n";

  // Add data rows
  data.forEach((row) => {
    const values = columns.map((col) => {
      const value = row[col];
      // Handle nested properties
      if (typeof value === "object") return "";
      // Escape quotes and wrap in quotes if contains comma
      const stringValue = String(value || "");
      return stringValue.includes(",")
        ? `"${stringValue.replace(/"/g, '""')}"`
        : stringValue;
    });
    csvContent += values.join(",") + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const printReport = (
  data: any[],
  title: string,
  headers: string[],
  columns: string[]
) => {
  const printWindow = window.open(" ", "_blank");
  if (!printWindow) return;

  let htmlContent = `
    <html>
      <head>
      
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { margin: 0; color: #468847; font-size: 28px; }
          .header p { margin: 5px 0 0 0; color: #666; font-size: 16px; }
          .header-date { text-align: right; color: #999; font-size: 12px; margin-bottom: 20px; }
          h2 { text-align: center; color: #333; margin-top: 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 12px; text-align: left; border: 1px solid #ddd; }
          th { background-color: #468847; color: white; font-weight: bold; }
          tr:nth-child(even) { background-color: #f2f4f8; }
          tr:nth-child(odd) { background-color: #f9fafc; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Sense Innovation IT</h1>
          <p>${title}</p>
        </div>
        <table>
          <thead>
            <tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>
          </thead>
          <tbody>
            ${data
              .map(
                (row) =>
                  `<tr>${columns
                    .map((col) => {
                      const value = row[col];
                      if (typeof value === "object") return "<td>-</td>";
                      return `<td>${value || "-"}</td>`;
                    })
                    .join("")}</tr>`
              )
              .join("")}
          </tbody>
        </table>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  setTimeout(() => printWindow.print(), 250);
};

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"agent" | "project" | "daily">(
    "agent"
  );
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);

  // Date filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchReport();
  }, [activeTab, startDate, endDate]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      let response;
      const params = {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      if (activeTab === "agent") {
        response = await reportsAPI.getAgentPerformance(params);
      } else if (activeTab === "project") {
        response = await reportsAPI.getProjectPerformance(params);
      } else {
        response = await reportsAPI.getDailyActivity(params);
      }

      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch report:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Reports & Analytics
        </h1>
        <p className="text-sm text-gray-600">
          Monitor performance and activity
        </p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#468847]"
            />
          </div>
          <button
            onClick={() => {
              setStartDate("");
              setEndDate("");
            }}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("agent")}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === "agent"
              ? "border-[#468847] text-[#468847]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Agent Performance
        </button>
        <button
          onClick={() => setActiveTab("project")}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === "project"
              ? "border-[#468847] text-[#468847]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Project Performance
        </button>
        <button
          onClick={() => setActiveTab("daily")}
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === "daily"
              ? "border-[#468847] text-[#468847]"
              : "border-transparent text-gray-500 hover:text-gray-700"
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
          <div className="p-8 text-center text-gray-500">
            No data found for the selected period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {activeTab === "agent" && (
                    <>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Agent
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Code
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                        Total Interactions
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                        Calls
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                        SMS
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                        WhatsApp
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                        Sales
                      </th>
                    </>
                  )}
                  {activeTab === "project" && (
                    <>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Project
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Code
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                        Total Interactions
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                        Sales Generated
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                        Conversion Rate
                      </th>
                    </>
                  )}
                  {activeTab === "daily" && (
                    <>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Date
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                        Total Interactions
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                        Sales Generated
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100"
                    style={{
                      backgroundColor: index % 2 === 0 ? "#f2f4f8" : "#f9fafc",
                    }}
                  >
                    {activeTab === "agent" && (
                      <>
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {row.agent_name}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {row.empcode}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-900">
                          {row.total_interactions}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-600">
                          {row.total_calls || 0}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-600">
                          {row.total_sms || 0}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-600">
                          {row.total_whatsapp || 0}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-green-600">
                          {row.sales_generated || 0}
                        </td>
                      </>
                    )}
                    {activeTab === "project" && (
                      <>
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {row.projectname}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {row.projectcode}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-900">
                          {row.total_interactions}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-green-600">
                          {row.sales_generated || 0}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-600">
                          {row.total_interactions > 0
                            ? `${(
                                ((row.sales_generated || 0) /
                                  row.total_interactions) *
                                100
                              ).toFixed(1)}%`
                            : "0%"}
                        </td>
                      </>
                    )}
                    {activeTab === "daily" && (
                      <>
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {new Date(row.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-900">
                          {row.total_interactions}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-green-600">
                          {row.sales_generated || 0}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length > 0 && (
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => {
                    let columns: string[] = [];
                    let headers: string[] = [];
                    let title = "Report";

                    if (activeTab === "agent") {
                      columns = [
                        "agent_name",
                        "empcode",
                        "total_interactions",
                        "total_calls",
                        "total_sms",
                        "total_whatsapp",
                        "sales_generated",
                      ];
                      headers = [
                        "Agent",
                        "Code",
                        "Total Interactions",
                        "Calls",
                        "SMS",
                        "WhatsApp",
                        "Sales",
                      ];
                      title = "Agent Performance Report";
                    } else if (activeTab === "project") {
                      columns = [
                        "projectname",
                        "projectcode",
                        "total_interactions",
                        "sales_generated",
                      ];
                      headers = [
                        "Project",
                        "Code",
                        "Total Interactions",
                        "Sales Generated",
                      ];
                      title = "Project Performance Report";
                    } else {
                      columns = [
                        "date",
                        "total_interactions",
                        "sales_generated",
                      ];
                      headers = [
                        "Date",
                        "Total Interactions",
                        "Sales Generated",
                      ];
                      title = "Daily Activity Report";
                    }

                    exportToExcel(data, title, columns, headers);
                  }}
                  className="bg-[#549150] text-white px-4 py-2 rounded-lg hover:bg-[#3a7039] transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Download Excel
                </button>
                <button
                  onClick={() => {
                    let columns: string[] = [];
                    let headers: string[] = [];
                    let title = "Report";

                    if (activeTab === "agent") {
                      columns = [
                        "agent_name",
                        "empcode",
                        "total_interactions",
                        "total_calls",
                        "total_sms",
                        "total_whatsapp",
                        "sales_generated",
                      ];
                      headers = [
                        "Agent",
                        "Code",
                        "Total Interactions",
                        "Calls",
                        "SMS",
                        "WhatsApp",
                        "Sales",
                      ];
                      title = "Agent Performance Report";
                    } else if (activeTab === "project") {
                      columns = [
                        "projectname",
                        "projectcode",
                        "total_interactions",
                        "sales_generated",
                      ];
                      headers = [
                        "Project",
                        "Code",
                        "Total Interactions",
                        "Sales Generated",
                      ];
                      title = "Project Performance Report";
                    } else {
                      columns = [
                        "date",
                        "total_interactions",
                        "sales_generated",
                      ];
                      headers = [
                        "Date",
                        "Total Interactions",
                        "Sales Generated",
                      ];
                      title = "Daily Activity Report";
                    }

                    printReport(data, title, headers, columns);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                  </svg>
                  Print Report
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
