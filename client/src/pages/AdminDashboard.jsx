import { useEffect, useState } from "react";
import DashboardHeader from "../../components/DashboardHeader";
import StatsCard from "../../components/StatsCard";
import Loader from "../../components/Loader";
import { adminAPI } from "../lib/api";

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [csvFile, setCsvFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await adminAPI.dashboard();
      setDashboard(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const uploadCSV = async () => {
    if (!csvFile) {
      alert("Please select a CSV file.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", csvFile);

      await adminAPI.uploadUsers(formData);

      alert("Users imported successfully.");

      setCsvFile(null);

      loadDashboard();

    } catch (err) {

      alert(
        err.response?.data?.message ||
        "Unable to upload CSV."
      );

    } finally {

      setUploading(false);

    }
  };

  if (loading) return <Loader />;

  return (
    <>
      <DashboardHeader
        title="Admin Dashboard"
        subtitle="Manage users and platform statistics"
      />

      <div className="grid grid-cols-3 gap-6 mb-8">

        <StatsCard
          title="Total Users"
          value={dashboard.totalUsers}
        />

        <StatsCard
          title="Mentors"
          value={dashboard.mentors}
          color="bg-green-600"
        />

        <StatsCard
          title="Mentees"
          value={dashboard.mentees}
          color="bg-blue-600"
        />

        <StatsCard
          title="Coordinators"
          value={dashboard.coordinators}
          color="bg-orange-500"
        />

        <StatsCard
          title="Super Coordinators"
          value={dashboard.superCoordinators}
          color="bg-purple-600"
        />

        <StatsCard
          title="Admins"
          value={dashboard.admins}
          color="bg-red-600"
        />

        <StatsCard
          title="Mentorships"
          value={dashboard.totalMentorships}
        />

        <StatsCard
          title="Interactions"
          value={dashboard.totalInteractions}
          color="bg-indigo-600"
        />

        <StatsCard
          title="Feedback"
          value={dashboard.totalFeedbackSubmitted}
          color="bg-teal-600"
        />

      </div>
            {/* Upload Users */}

      <div className="bg-white rounded-xl shadow p-6 mb-8">

        <h2 className="text-2xl font-semibold mb-5">
          Upload Users CSV
        </h2>

        <div className="flex items-center gap-4">

          <input
            type="file"
            accept=".csv"
            onChange={(e) => setCsvFile(e.target.files[0])}
            className="border rounded-lg p-2"
          />

          <button
            onClick={uploadCSV}
            disabled={uploading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg disabled:bg-gray-400"
          >
            {uploading ? "Uploading..." : "Upload CSV"}
          </button>

        </div>

        {csvFile && (
          <p className="mt-3 text-sm text-gray-600">
            Selected File: <strong>{csvFile.name}</strong>
          </p>
        )}

      </div>

      {/* Platform Statistics */}

      <div className="bg-white rounded-xl shadow p-6">

        <h2 className="text-2xl font-semibold mb-5">
          Platform Overview
        </h2>

        <div className="grid grid-cols-2 gap-6">

          <div className="border rounded-lg p-4">
            <p className="text-gray-500">Total Users</p>
            <h3 className="text-3xl font-bold mt-2">
              {dashboard.totalUsers}
            </h3>
          </div>

          <div className="border rounded-lg p-4">
            <p className="text-gray-500">Total Mentorships</p>
            <h3 className="text-3xl font-bold mt-2">
              {dashboard.totalMentorships}
            </h3>
          </div>

          <div className="border rounded-lg p-4">
            <p className="text-gray-500">Total Interactions</p>
            <h3 className="text-3xl font-bold mt-2">
              {dashboard.totalInteractions}
            </h3>
          </div>

          <div className="border rounded-lg p-4">
            <p className="text-gray-500">Total Feedback Submitted</p>
            <h3 className="text-3xl font-bold mt-2">
              {dashboard.totalFeedbackSubmitted}
            </h3>
          </div>

        </div>

      </div>

    </>
  );
}