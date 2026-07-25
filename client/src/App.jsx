import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useSearchParams,
  useNavigate,
} from "react-router-dom";

/* Layout */
import DashboardLayout from "./layouts/DashboardLayout";

/* Pages */
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import CoordinatorDashboard from "./pages/CoordinatorDashboard";
import MentorDashboard from "./pages/MentorDashboard";
import MenteeDashboard from "./pages/MenteeDashboard";
import { authAPI } from "./lib/api";

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

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

/* ==========================================================
   Google OAuth Handler
   Backend still redirects with ?token=&user= — we cannot stop that
   without backend changes. Frontend mitigates by:
   1) reading the token once
   2) immediately replacing the history entry (strip query from URL)
   3) loading the user from /auth/me (ignore user blob in URL)
========================================================== */

const GoogleAuthHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const finishWithToken = async (token) => {
      localStorage.setItem("token", token);

      try {
        const res = await authAPI.me();
        if (cancelled) return;

        const user = res.data?.user;
        if (!user?.role) {
          throw new Error("Invalid user");
        }

        localStorage.setItem("user", JSON.stringify(user));
        navigate(roleHome(user.role), { replace: true });
      } catch {
        if (cancelled) return;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setError("Sign-in failed. Please try again.");
        navigate("/", { replace: true });
      }
    };

    const tokenFromUrl = searchParams.get("token");

    if (tokenFromUrl) {
      // Drop token/user from the address bar + history entry ASAP
      navigate("/dashboard", { replace: true });
      finishWithToken(tokenFromUrl);
      return () => {
        cancelled = true;
      };
    }

    const cachedToken = localStorage.getItem("token");
    if (cachedToken) {
      finishWithToken(cachedToken);
      return () => {
        cancelled = true;
      };
    }

    navigate("/", { replace: true });
    return () => {
      cancelled = true;
    };
  }, [searchParams, navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      {error || "Signing you in..."}
    </div>
  );
};

/* ==========================================================
   Protected Route
========================================================== */

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const user = readStoredUser();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};



export default function App() {

  return (

    <Router>

      <Routes>

        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={<GoogleAuthHandler />}
        />

        <Route element={<DashboardLayout />}>

          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute
                allowedRoles={["admin"]}
              >
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/coordinator-dashboard"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "coordinator",
                  "super_coordinator",
                ]}
              >
                <CoordinatorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mentor-dashboard"
            element={
              <ProtectedRoute
                allowedRoles={["mentor"]}
              >
                <MentorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mentee-dashboard"
            element={
              <ProtectedRoute
                allowedRoles={["mentee"]}
              >
                <MenteeDashboard />
              </ProtectedRoute>
            }
          />

        </Route>

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>

    </Router>

  );

}