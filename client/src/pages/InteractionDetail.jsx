import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DashboardHeader from "../../components/DashboardHeader";
import Loader from "../../components/Loader";
import { coordinatorAPI, sessionAPI } from "../lib/api";
import { toast } from "../lib/toast";

function roleHome(role) {
  switch (role) {
    case "admin":
      return "/admin-dashboard";
    case "coordinator":
    case "super_coordinator":
      return "/coordinator-dashboard";
    case "mentor":
      return "/mentor-dashboard";
    case "mentee":
      return "/mentee-dashboard";
    default:
      return "/";
  }
}

function StatusPill({ status }) {
  const tone =
    status === "verified" || status === "approved"
      ? "bg-green-100 text-green-800"
      : status === "rejected"
        ? "bg-red-100 text-red-800"
        : "bg-yellow-100 text-yellow-800";

  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold capitalize ${tone}`}>
      {status || "pending"}
    </span>
  );
}

function StudentList({ title, items, empty }) {
  return (
    <div className="dash-box">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      {items.length === 0 ? (
        <p className="text-gray-500 text-sm">{empty}</p>
      ) : (
        <ul className="space-y-3">
          {items.map(({ student, remarks, verifiedAt }) => (
            <li
              key={student?._id || student?.rollNo}
              className="border rounded-xl p-3 bg-white/70"
            >
              <p className="font-semibold">{student?.name || "-"}</p>
              <p className="text-sm text-gray-500">
                {student?.rollNo || ""}
                {student?.department ? ` · ${student.department}` : ""}
              </p>
              {verifiedAt ? (
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(verifiedAt).toLocaleString()}
                </p>
              ) : null}
              {remarks ? (
                <p className="text-sm mt-2 text-gray-700">{remarks}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function InteractionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const backTo = roleHome(user?.role);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const canReviewEvidence =
    user?.role === "coordinator" || user?.role === "super_coordinator";

  const isCoordStaff =
    user?.role === "coordinator" ||
    user?.role === "super_coordinator" ||
    user?.role === "admin";

  // Feedback is mentee-only; private to coordinators/admins (plus the mentee's own)
  const visibleFeedbacks = (data?.feedbacks || []).filter((fb) => {
    if (fb.submittedBy !== "mentee") return false;
    return isCoordStaff || String(fb.mentee?._id || fb.mentee) === String(user?._id);
  });

  const load = async ({ showLoader = false } = {}) => {
    try {
      if (showLoader) setLoading(true);
      setError("");
      const res = await sessionAPI.getById(id);
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load interaction.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load({ showLoader: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const reviewEvidence = async (status) => {
    let remarks = "";
    if (status === "rejected") {
      const input = window.prompt("Reason for rejecting evidence (optional):");
      if (input === null) return;
      remarks = input;
    }

    try {
      setBusy(true);
      await coordinatorAPI.verifyEvidence(id, { status, remarks });
      toast.success(
        status === "verified"
          ? "Meeting evidence verified."
          : "Meeting evidence rejected."
      );
      await load();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Unable to update evidence status."
      );
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loader />;

  if (error || !data) {
    return (
      <>
        <DashboardHeader title="Interaction" subtitle="Details unavailable" />
        <div className="dash-box">
          <p className="text-red-600 mb-4">{error || "Not found."}</p>
          <button
            type="button"
            onClick={() => navigate(backTo)}
            className="bg-slate-800 text-white px-4 py-2 rounded-lg"
          >
            Back to dashboard
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mb-4">
        <Link
          to={backTo}
          className="text-sky-800 font-semibold hover:underline text-sm"
        >
          ← Back to dashboard
        </Link>
      </div>

      <DashboardHeader
        title="Interaction details"
        subtitle={`${data.interactionType} · ${new Date(
          data.interactionDate
        ).toLocaleDateString()}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <div className="dash-box space-y-4">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <h2 className="text-xl font-semibold">Overview</h2>
            <StatusPill status={data.coordinatorEvidenceStatus} />
          </div>

          <div>
            <p className="text-sm text-gray-500">Mentor</p>
            <p className="font-semibold">{data.mentor?.name || "-"}</p>
            <p className="text-sm text-gray-500">
              {data.mentor?.rollNo || ""}
              {data.mentor?.department ? ` · ${data.mentor.department}` : ""}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Meeting summary</p>
            <p className="mt-1 whitespace-pre-wrap leading-relaxed">
              {data.meetingSummary}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Meeting image</p>
            {data.imageLink ? (
              <a
                href={data.imageLink}
                target="_blank"
                rel="noreferrer"
                className="text-sky-700 underline font-medium break-all"
              >
                {data.imageLink}
              </a>
            ) : (
              <p className="text-gray-400">No image link</p>
            )}
          </div>

          {(data.coordinatorEvidenceRemarks || data.coordinatorVerifiedBy) && (
            <div className="border-t pt-3 text-sm text-gray-600 space-y-1">
              {data.coordinatorVerifiedBy ? (
                <p>
                  Reviewed by{" "}
                  <strong>{data.coordinatorVerifiedBy.name}</strong>
                  {data.coordinatorVerifiedAt
                    ? ` · ${new Date(data.coordinatorVerifiedAt).toLocaleString()}`
                    : ""}
                </p>
              ) : null}
              {data.coordinatorEvidenceRemarks ? (
                <p>Remarks: {data.coordinatorEvidenceRemarks}</p>
              ) : null}
            </div>
          )}

          {canReviewEvidence &&
            data.coordinatorEvidenceStatus === "pending" && (
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => reviewEvidence("verified")}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-60"
                >
                  Verify evidence
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => reviewEvidence("rejected")}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg disabled:opacity-60"
                >
                  Reject evidence
                </button>
              </div>
            )}
        </div>

        <div className="space-y-4 sm:space-y-6">
          <StudentList
            title={`Approved (${data.approved.length})`}
            items={data.approved}
            empty="No mentees have approved yet."
          />
          <StudentList
            title={`Pending (${data.pending.length})`}
            items={data.pending}
            empty="No pending mentees."
          />
          <StudentList
            title={`Rejected (${data.rejected.length})`}
            items={data.rejected}
            empty="No rejections."
          />
        </div>
      </div>

      {(isCoordStaff || visibleFeedbacks.length > 0) && (
      <div className="dash-box">
        <h3 className="text-lg font-semibold mb-3">
          Feedback ({visibleFeedbacks.length})
          {isCoordStaff ? (
            <span className="block text-sm font-normal text-gray-500 mt-1">
              Mentee feedback is only visible to coordinators.
            </span>
          ) : null}
        </h3>
        {!visibleFeedbacks.length ? (
          <p className="text-gray-500 text-sm">No feedback submitted yet.</p>
        ) : (
          <div className="space-y-3">
            {visibleFeedbacks.map((fb) => (
              <div key={fb._id} className="border rounded-xl p-4">
                <div className="flex flex-wrap justify-between gap-2">
                  <p className="font-semibold">
                    Mentee
                    {fb.mentee?.name ? ` · ${fb.mentee.name}` : ""}
                  </p>
                  <span className="text-sm font-semibold text-indigo-700">
                    ⭐ {fb.rating}/5
                  </span>
                </div>
                <p className="mt-2 text-gray-700 whitespace-pre-wrap">
                  {fb.feedback}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      )}
    </>
  );
}
