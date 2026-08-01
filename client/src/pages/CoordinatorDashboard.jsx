import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardHeader from "../../components/DashboardHeader";
import StatsCard from "../../components/StatsCard";
import Loader from "../../components/Loader";
import { coordinatorAPI } from "../lib/api";
import { toast } from "../lib/toast";
import { normalizeDepartment } from "../lib/departments";

function matchesSearch(text, query) {
  if (!query.trim()) return true;
  return String(text || "")
    .toLowerCase()
    .includes(query.trim().toLowerCase());
}

function mentorIdOf(item) {
  const id = item?.mentor?._id || item?.mentor;
  return id ? String(id) : "";
}

function deptOf(item) {
  return normalizeDepartment(item?.department || item?.mentor?.department || "");
}

export default function CoordinatorDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [selectedMentorId, setSelectedMentorId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  const title =
    user?.role === "super_coordinator"
      ? "Super Coordinator Dashboard"
      : "Coordinator Dashboard";

  const subtitle =
    user?.role === "super_coordinator"
      ? "Monitor the institute mentorship program"
      : "Monitor the department mentorship program";

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await coordinatorAPI.dashboard();
      setDashboard(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reviewEvidence = async (sessionId, status) => {
    let remarks = "";
    if (status === "rejected") {
      const input = window.prompt("Reason for rejecting evidence (optional):");
      if (input === null) return;
      remarks = input;
    }

    try {
      await coordinatorAPI.verifyEvidence(sessionId, { status, remarks });
      toast.success(
        status === "verified"
          ? "Meeting evidence verified."
          : "Meeting evidence rejected."
      );
      await loadDashboard();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Unable to update evidence status."
      );
    }
  };

  const departments = useMemo(() => {
    if (!dashboard) return [];
    const set = new Set();
    (dashboard.mentorList || []).forEach((m) => {
      const d = normalizeDepartment(m.department);
      if (d) set.add(d);
    });
    (dashboard.pendingVerificationList || []).forEach((item) => {
      const d = deptOf(item);
      if (d) set.add(d);
    });
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [dashboard]);

  const filteredMentors = useMemo(() => {
    if (!dashboard) return [];
    let list = [...(dashboard.mentorList || [])];

    // When a mentor is selected, show only that mentor in the list
    if (selectedMentorId) {
      return list.filter((m) => String(m._id) === String(selectedMentorId));
    }

    if (department !== "all") {
      list = list.filter(
        (m) => normalizeDepartment(m.department) === department
      );
    }

    list = list.filter(
      (m) =>
        matchesSearch(m.name, search) ||
        matchesSearch(m.rollNo, search) ||
        matchesSearch(m.email, search) ||
        matchesSearch(normalizeDepartment(m.department), search)
    );

    list.sort((a, b) => {
      const deptA = normalizeDepartment(a.department);
      const deptB = normalizeDepartment(b.department);
      if (sortBy === "dept-asc") {
        return deptA.localeCompare(deptB) ||
          (a.name || "").localeCompare(b.name || "");
      }
      if (sortBy === "dept-desc") {
        return deptB.localeCompare(deptA) ||
          (a.name || "").localeCompare(b.name || "");
      }
      if (sortBy === "name-asc") {
        return (a.name || "").localeCompare(b.name || "");
      }
      return (a.name || "").localeCompare(b.name || "");
    });

    return list;
  }, [dashboard, search, department, sortBy, selectedMentorId]);

  const selectedMentor = useMemo(() => {
    if (!dashboard || !selectedMentorId) return null;
    return (
      (dashboard.mentorList || []).find(
        (m) => String(m._id) === String(selectedMentorId)
      ) || null
    );
  }, [dashboard, selectedMentorId]);

  const filteredPending = useMemo(() => {
    if (!dashboard) return [];
    let list = [...(dashboard.pendingVerificationList || [])];

    if (selectedMentorId) {
      list = list.filter(
        (item) => mentorIdOf(item) === String(selectedMentorId)
      );
    } else {
      if (department !== "all") {
        list = list.filter((item) => deptOf(item) === department);
      }

      list = list.filter((item) => {
        const menteeNames = (item.mentees || []).map((m) => m?.name).join(" ");
        return (
          matchesSearch(item.mentor?.name, search) ||
          matchesSearch(item.mentor?.rollNo, search) ||
          matchesSearch(deptOf(item), search) ||
          matchesSearch(menteeNames, search) ||
          matchesSearch(item.meetingSummary, search)
        );
      });
    }

    list.sort((a, b) => {
      const deptA = deptOf(a);
      const deptB = deptOf(b);
      if (sortBy === "dept-asc") {
        return deptA.localeCompare(deptB) ||
          new Date(b.interactionDate) - new Date(a.interactionDate);
      }
      if (sortBy === "dept-desc") {
        return deptB.localeCompare(deptA) ||
          new Date(b.interactionDate) - new Date(a.interactionDate);
      }
      if (sortBy === "name-asc") {
        return (a.mentor?.name || "").localeCompare(b.mentor?.name || "");
      }
      // date-desc default
      return new Date(b.interactionDate) - new Date(a.interactionDate);
    });

    return list;
  }, [dashboard, search, department, sortBy, selectedMentorId]);

  const filteredMenteeFeedbacks = useMemo(() => {
    if (!dashboard) return [];
    let list = [...(dashboard.menteeFeedbacks || [])];
    if (selectedMentorId) {
      return list.filter(
        (f) => mentorIdOf(f) === String(selectedMentorId)
      );
    }
    if (department !== "all") {
      list = list.filter(
        (f) => normalizeDepartment(f.mentor?.department) === department
      );
    }
    if (search.trim()) {
      list = list.filter(
        (f) =>
          matchesSearch(f.mentor?.name, search) ||
          matchesSearch(f.mentee?.name, search) ||
          matchesSearch(normalizeDepartment(f.mentor?.department), search) ||
          matchesSearch(f.feedback, search)
      );
    }
    return list;
  }, [dashboard, search, department, selectedMentorId]);

  const selectMentor = (mentor) => {
    const id = String(mentor._id);
    setSelectedMentorId((prev) => (prev === id ? null : id));
  };

  if (loading) return <Loader />;

  return (
    <>
      <DashboardHeader
        title={title}
        subtitle={subtitle}
      />

      <div className="dash-box mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="block">
            <span className="text-sm font-semibold text-gray-600">Search</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Mentor name, roll no, mentee…"
              className="mt-1 w-full border rounded-xl px-3 py-2.5"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-gray-600">Department</span>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="mt-1 w-full border rounded-xl px-3 py-2.5 bg-white"
            >
              <option value="all">All departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-gray-600">Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="mt-1 w-full border rounded-xl px-3 py-2.5 bg-white"
            >
              <option value="date-desc">Newest date</option>
              <option value="dept-asc">Department A–Z</option>
              <option value="dept-desc">Department Z–A</option>
              <option value="name-asc">Mentor name A–Z</option>
            </select>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">

        <StatsCard
          title="Mentors"
          value={dashboard.cards.totalMentors}
        />

        <StatsCard
          title="Pending Verifications"
          value={
            selectedMentorId
              ? filteredPending.length
              : dashboard.cards.pendingVerifications
          }
          color="bg-yellow-500"
        />

        <StatsCard
          title="Mentee feedback (private)"
          value={
            selectedMentorId
              ? filteredMenteeFeedbacks.length
              : dashboard.cards.menteeFeedbackSubmitted || 0
          }
          color="bg-indigo-600"
        />

      </div>

      {selectedMentor ? (
        <div className="dash-box mb-6 flex flex-wrap items-center justify-between gap-3 border-l-4 border-sky-600">
          <div>
            <p className="text-sm text-gray-500">Viewing interactions for</p>
            <p className="font-semibold text-lg">
              {selectedMentor.name}
              <span className="text-gray-500 font-normal text-sm ml-2">
                {selectedMentor.rollNo}
                {normalizeDepartment(selectedMentor.department)
                  ? ` · ${normalizeDepartment(selectedMentor.department)}`
                  : ""}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedMentorId(null)}
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-sm"
          >
            Clear selection
          </button>
        </div>
      ) : null}

            {/* Mentor List */}

      <div className="dash-box dash-box--no-hover mb-8">

        <h2 className="text-xl sm:text-2xl font-semibold mb-2">
          Mentor List
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Click a mentor to show only their interactions. Showing{" "}
          {filteredMentors.length} of {dashboard.mentorList.length}
        </p>

        <div className="overflow-x-auto">

          <table className="min-w-full border">

            <thead className="bg-slate-100">

              <tr>

                <th className="p-3 text-left">Roll No</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Department</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-center">Assigned Mentees</th>
                <th className="p-3 text-center">Interactions</th>

              </tr>

            </thead>

            <tbody>

              {filteredMentors.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    className="text-center p-6 text-gray-500"
                  >
                    No mentors match your filters.
                  </td>

                </tr>

              ) : (

                filteredMentors.map((mentor) => {
                  const isSelected =
                    String(selectedMentorId) === String(mentor._id);

                  return (
                  <tr
                    key={mentor._id}
                    onClick={() => selectMentor(mentor)}
                    className={`border-t cursor-pointer ${
                      isSelected ? "bg-sky-50" : ""
                    }`}
                  >

                    <td className="p-3">
                      {mentor.rollNo}
                    </td>

                    <td className="p-3 font-medium">
                      {mentor.name}
                      {isSelected ? (
                        <span className="ml-2 text-xs font-semibold text-sky-700">
                          Selected
                        </span>
                      ) : null}
                    </td>

                    <td className="p-3">
                      {normalizeDepartment(mentor.department) || "-"}
                    </td>

                    <td className="p-3">
                      {mentor.email}
                    </td>

                    <td className="p-3 text-center">

                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">

                        {mentor.assignedMentees}

                      </span>

                    </td>

                    <td className="p-3 text-center">

                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">

                        {mentor.interactions}

                      </span>

                    </td>

                  </tr>
                  );
                })

              )}

            </tbody>

          </table>

        </div>

      </div>
            {/* Pending Verifications */}

      <div className="dash-box mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold mb-2">
          Pending Verifications
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Meeting photos waiting for you to Verify or Reject. Showing{" "}
          {filteredPending.length}
          {selectedMentor
            ? ` for ${selectedMentor.name}`
            : ` of ${dashboard.pendingVerificationList.length}`}.
        </p>

        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Mentor</th>
                <th className="p-3 text-left">Dept</th>
                <th className="p-3 text-left">Mentees</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Summary</th>
                <th className="p-3 text-left">Image</th>
                <th className="p-3 text-center">Details</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredPending.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="text-center p-6 text-gray-500"
                  >
                    {dashboard.pendingVerificationList.length === 0
                      ? "No pending verifications."
                      : "No verifications match your filters."}
                  </td>
                </tr>
              ) : (
                filteredPending.map((item) => (
                  <tr key={item.sessionId} className="border-t">
                    <td className="p-3 whitespace-nowrap">
                      {new Date(item.interactionDate).toLocaleDateString()}
                    </td>

                    <td className="p-3">
                      <div className="font-medium">{item.mentor?.name}</div>
                      <div className="text-xs text-gray-500">
                        {item.mentor?.rollNo || ""}
                      </div>
                    </td>

                    <td className="p-3">
                      {deptOf(item) || "-"}
                    </td>

                    <td className="p-3">
                      {(item.mentees || [])
                        .map((m) => m?.name)
                        .filter(Boolean)
                        .join(", ") || "-"}
                    </td>

                    <td className="p-3">
                      {item.interactionType}
                    </td>

                    <td className="p-3 max-w-[12rem] truncate" title={item.meetingSummary}>
                      {item.meetingSummary}
                    </td>

                    <td className="p-3">
                      {item.imageLink ? (
                        <a
                          href={item.imageLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-700 underline font-medium"
                        >
                          Open image
                        </a>
                      ) : (
                        <span className="text-gray-400">No link</span>
                      )}
                    </td>

                    <td className="p-3 text-center">
                      <Link
                        to={`/interaction/${item.sessionId}`}
                        className="text-sky-700 font-semibold underline"
                      >
                        View
                      </Link>
                    </td>

                    <td className="p-3">
                      <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <button
                          type="button"
                          onClick={() => reviewEvidence(item.sessionId, "verified")}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm whitespace-nowrap"
                        >
                          Verify
                        </button>
                        <button
                          type="button"
                          onClick={() => reviewEvidence(item.sessionId, "rejected")}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm whitespace-nowrap"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mentee feedback — coordinators only (hidden from mentors) */}

      <div className="dash-box mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold mb-2">
          Mentee Feedback
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Private reviews from mentees about mentors. Not visible to mentors.
          Showing {filteredMenteeFeedbacks.length}
          {selectedMentor
            ? ` for ${selectedMentor.name}`
            : ` of ${(dashboard.menteeFeedbacks || []).length}`}.
        </p>

        <div className="space-y-4">
          {filteredMenteeFeedbacks.length === 0 ? (
            <p className="text-gray-500">
              {(dashboard.menteeFeedbacks || []).length === 0
                ? "No mentee feedback submitted yet."
                : "No mentee feedback for this filter."}
            </p>
          ) : (
            filteredMenteeFeedbacks.map((feedback) => (
              <div key={feedback._id} className="border rounded-lg p-5">
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-lg">
                      {feedback.mentee?.name || "Mentee"}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      About mentor: {feedback.mentor?.name || "-"}
                      {normalizeDepartment(feedback.mentor?.department)
                        ? ` · ${normalizeDepartment(feedback.mentor.department)}`
                        : ""}
                    </p>
                  </div>
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full shrink-0">
                    ⭐ {feedback.rating}/5
                  </span>
                </div>

                <div className="mt-4">
                  <p>
                    <strong>Interaction:</strong>{" "}
                    {feedback.session?.interactionType}
                  </p>
                  <p className="mt-2">
                    <strong>Summary:</strong>{" "}
                    {feedback.session?.meetingSummary}
                  </p>
                  {feedback.session?._id ? (
                    <p className="mt-2">
                      <Link
                        to={`/interaction/${feedback.session._id}`}
                        className="text-sky-700 underline font-medium"
                      >
                        Open interaction
                      </Link>
                    </p>
                  ) : null}
                  <p className="mt-3 text-gray-700 whitespace-pre-wrap">
                    {feedback.feedback}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </>
  );
}