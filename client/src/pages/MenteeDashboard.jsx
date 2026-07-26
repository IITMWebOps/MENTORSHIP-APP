import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardHeader from "../../components/DashboardHeader";
import StatsCard from "../../components/StatsCard";

import Loader from "../../components/Loader";
import API, { menteeAPI, feedbackAPI } from "../lib/api";
import { toast } from "../lib/toast";

export default function MenteeDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const [feedbackModal, setFeedbackModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  const [feedbackData, setFeedbackData] = useState({
    rating: 5,
    feedback: "",
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await menteeAPI.dashboard();
      setDashboard(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const approveInteraction = async (id) => {
    try {
      await API.put(`/sessions/${id}/approve`);
      toast.success("Interaction approved.");
      loadDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to approve interaction.");
    }
  };

  const rejectInteraction = async (id) => {
    try {
      await API.put(`/sessions/${id}/reject`, {
        verificationRemarks: "",
      });
      toast.success("Interaction rejected.");
      loadDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to reject interaction.");
    }
  };

  const submitFeedback = async () => {
    try {
      await feedbackAPI.submit({
        sessionId: selectedSession,
        rating: feedbackData.rating,
        feedback: feedbackData.feedback,
      });

      setFeedbackModal(false);
      setFeedbackData({
        rating: 5,
        feedback: "",
      });

      toast.success("Feedback submitted.");
      loadDashboard();

    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to submit feedback.");
    }
  };

  if (loading) return <Loader />;

  const feedbackSubmittedIds = new Set(
    (dashboard.feedbackHistory || [])
      .filter((item) => item.myFeedback)
      .map((item) => String(item.sessionId))
  );

  return (
    <>
      <DashboardHeader
        title="Mentee Dashboard"
        subtitle="Manage your mentorship interactions"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <StatsCard
          title="Pending"
          value={dashboard.pendingInteractions.length}
          color="bg-yellow-500"
        />

        <StatsCard
          title="Approved"
          value={dashboard.approvedInteractions.length}
          color="bg-green-600"
        />

        <StatsCard
          title="Rejected"
          value={dashboard.rejectedInteractions.length}
          color="bg-red-600"
        />

        <StatsCard
          title="Meetings"
          value={dashboard.feedbackHistory.length}
        />
      </div>
            {/* My Mentor */}

      <div className="dash-box mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold mb-5">My Mentor</h2>

        {dashboard.mentor ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <p className="text-gray-500 text-sm">Name</p>
              <p className="font-semibold">{dashboard.mentor.name}</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Roll No</p>
              <p className="font-semibold">{dashboard.mentor.rollNo}</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Email</p>
              <p>{dashboard.mentor.email}</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Mobile</p>
              <p>{dashboard.mentor.mobile || "-"}</p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Department</p>
              <p>{dashboard.mentor.department}</p>
            </div>

          </div>
        ) : (
          <p className="text-gray-500">
            Mentor has not been assigned yet.
          </p>
        )}
      </div>

      {/* Pending Interactions */}

      <div className="dash-box mb-8">

        <h2 className="text-2xl font-semibold mb-5">
          Pending Interactions
        </h2>

        <div className="overflow-x-auto">

          <table className="min-w-full border">

            <thead className="bg-slate-100">

              <tr>

                <th className="p-3 text-left">Date</th>

                <th className="p-3 text-left">Type</th>

                <th className="p-3 text-left">Summary</th>

                <th className="p-3 text-left">Image</th>

                <th className="p-3 text-center">Details</th>

                <th className="p-3 text-center">Action</th>

              </tr>

            </thead>

            <tbody>

              {dashboard.pendingInteractions.length === 0 ? (

                <tr>
                  <td
                    colSpan="6"
                    className="text-center p-6 text-gray-500"
                  >
                    No pending interactions.
                  </td>
                </tr>

              ) : (

                dashboard.pendingInteractions.map((item) => (

                  <tr key={item._id} className="border-t">

                    <td className="p-3">
                      {new Date(item.interactionDate).toLocaleDateString()}
                    </td>

                    <td className="p-3">
                      {item.interactionType}
                    </td>

                    <td className="p-3">
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
                          Image
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="p-3 text-center">
                      <Link
                        to={`/interaction/${item._id}`}
                        className="text-sky-700 font-semibold underline"
                      >
                        View
                      </Link>
                    </td>

                    <td className="p-3">

                      <div className="flex flex-col sm:flex-row gap-2 justify-center">

                        <button
                          onClick={() => approveInteraction(item._id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm whitespace-nowrap"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() => rejectInteraction(item._id)}
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
            {/* Approved Interactions */}

      <div className="dash-box mb-8">
        <h2 className="text-2xl font-semibold mb-5">
          Approved Interactions
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Summary</th>
                <th className="p-3 text-center">Details</th>
                <th className="p-3 text-center">Feedback</th>
              </tr>
            </thead>

            <tbody>
              {dashboard.approvedInteractions.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center p-6 text-gray-500"
                  >
                    No approved interactions.
                  </td>
                </tr>
              ) : (
                dashboard.approvedInteractions.map((item) => (
                  <tr key={item._id} className="border-t">
                    <td className="p-3">
                      {new Date(item.interactionDate).toLocaleDateString()}
                    </td>

                    <td className="p-3">
                      {item.interactionType}
                    </td>

                    <td className="p-3 max-w-[12rem] truncate" title={item.meetingSummary}>
                      {item.meetingSummary}
                    </td>

                    <td className="p-3 text-center">
                      <Link
                        to={`/interaction/${item._id}`}
                        className="text-sky-700 font-semibold underline"
                      >
                        View
                      </Link>
                    </td>

                    <td className="p-3 text-center">
                      {feedbackSubmittedIds.has(String(item._id)) ? (
                        <button
                          type="button"
                          disabled
                          className="bg-slate-200 text-slate-600 px-4 py-2 rounded cursor-default opacity-90"
                        >
                          Submitted
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSession(item._id);
                            setFeedbackModal(true);
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
                        >
                          Submit Feedback
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      </div>

      {/* Rejected Interactions */}

      <div className="dash-box mb-8">

        <h2 className="text-2xl font-semibold mb-5">
          Rejected Interactions
        </h2>

        <div className="overflow-x-auto">

          <table className="min-w-full border">

            <thead className="bg-slate-100">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Type</th>
                <th className="p-3">Summary</th>
                <th className="p-3 text-center">Details</th>
              </tr>
            </thead>

            <tbody>

              {dashboard.rejectedInteractions.length === 0 ? (

                <tr>
                  <td
                    colSpan="4"
                    className="text-center p-6 text-gray-500"
                  >
                    No rejected interactions.
                  </td>
                </tr>

              ) : (

                dashboard.rejectedInteractions.map((item) => (

                  <tr key={item._id} className="border-t">

                    <td className="p-3">
                      {new Date(item.interactionDate).toLocaleDateString()}
                    </td>

                    <td className="p-3">
                      {item.interactionType}
                    </td>

                    <td className="p-3 max-w-[12rem] truncate" title={item.meetingSummary}>
                      {item.meetingSummary}
                    </td>

                    <td className="p-3 text-center">
                      <Link
                        to={`/interaction/${item._id}`}
                        className="text-sky-700 font-semibold underline"
                      >
                        View
                      </Link>
                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* Meeting History */}

      <div className="dash-box mb-8">

        <h2 className="text-xl sm:text-2xl font-semibold mb-5">
          Meeting History
        </h2>

        <div className="space-y-4">

          {dashboard.feedbackHistory.length === 0 ? (

            <p className="text-gray-500">
              No meetings yet.
            </p>

          ) : (

            dashboard.feedbackHistory.map((item) => (

              <div
                key={item.sessionId}
                className="border rounded-lg p-4"
              >

                <div className="flex justify-between">

                  <div>

                    <h3 className="font-semibold">
                      {item.interactionType}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {new Date(
                        item.interactionDate
                      ).toLocaleDateString()}
                    </p>

                  </div>

                </div>

                <p className="mt-3">
                  <strong>Meeting Summary:</strong>{" "}
                  {item.meetingSummary}
                </p>

                {item.myFeedback ? (
                  <>
                    <hr className="my-4" />
                    <div>
                      <h4 className="font-semibold mb-2">Your Feedback</h4>
                      <p>Rating : {item.myFeedback.rating}/5</p>
                      <p className="mt-1">{item.myFeedback.feedback}</p>
                    </div>
                  </>
                ) : null}

              </div>

            ))

          )}

        </div>

      </div>
            {/* Feedback Modal */}

      {feedbackModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-5 sm:p-6 max-h-[90vh] overflow-y-auto">

            <h2 className="text-2xl font-semibold mb-5">
              Submit Feedback
            </h2>

            <div className="mb-4">
              <label className="block mb-2 font-medium">
                Rating
              </label>

              <select
                value={feedbackData.rating}
                onChange={(e) =>
                  setFeedbackData({
                    ...feedbackData,
                    rating: Number(e.target.value),
                  })
                }
                className="border rounded-lg p-3 w-full"
              >
                <option value={5}>5 - Excellent</option>
                <option value={4}>4 - Good</option>
                <option value={3}>3 - Average</option>
                <option value={2}>2 - Poor</option>
                <option value={1}>1 - Very Poor</option>
              </select>
            </div>

            <div className="mb-5">
              <label className="block mb-2 font-medium">
                Feedback
              </label>

              <textarea
                rows={5}
                value={feedbackData.feedback}
                onChange={(e) =>
                  setFeedbackData({
                    ...feedbackData,
                    feedback: e.target.value,
                  })
                }
                placeholder="Write your feedback..."
                className="border rounded-lg p-3 w-full"
              />
            </div>

            <div className="flex justify-end gap-3">

              <button
                onClick={() => {
                  setFeedbackModal(false);
                  setSelectedSession(null);
                  setFeedbackData({
                    rating: 5,
                    feedback: "",
                  });
                }}
                className="px-5 py-2 border rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={submitFeedback}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg"
              >
                Submit
              </button>

            </div>

          </div>
        </div>
      )}

    </>
  );
}