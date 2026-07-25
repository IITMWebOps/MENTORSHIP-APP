import React, { useEffect } from "react";
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

/* ==========================================================
   Google OAuth Handler
========================================================== */

const GoogleAuthHandler = () => {

  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  useEffect(() => {

    const token = searchParams.get("token");

    const userParam = searchParams.get("user");

    if (!token) {

      navigate("/");

      return;

    }

    localStorage.setItem("token", token);

    if (userParam) {

      localStorage.setItem(
        "user",
        decodeURIComponent(userParam)
      );

      const user = JSON.parse(
        decodeURIComponent(userParam)
      );

      switch (user.role) {

        case "admin":
          navigate("/admin-dashboard");
          break;

        case "coordinator":
        case "super_coordinator":
          navigate("/coordinator-dashboard");
          break;

        case "mentor":
          navigate("/mentor-dashboard");
          break;

        case "mentee":
          navigate("/mentee-dashboard");
          break;

        default:
          navigate("/");
      }

    }

  }, [searchParams, navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      Signing you in...
    </div>
  );

};

/* ==========================================================
   Protected Route
========================================================== */

const ProtectedRoute = ({ children, allowedRoles }) => {

  const token = localStorage.getItem("token");

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  if (!token) {

    return <Navigate to="/" replace />;

  }

  if (

    allowedRoles &&

    user &&

    !allowedRoles.includes(user.role)

  ) {

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