import { authAPI } from "../lib/api";

export default function Login() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-blue-600 to-cyan-500 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-10">

        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-indigo-700">
            SAATHI
          </h1>

          <p className="text-lg text-gray-600 mt-3">
            Student Mentorship Management System
          </p>

          <p className="text-gray-500 mt-2">
            Indian Institute of Technology Madras
          </p>
        </div>

        <button
          onClick={authAPI.googleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-xl py-3 font-semibold text-gray-700 hover:bg-gray-100 transition"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Sign in with IITM Google Account
        </button>

        <p className="text-center text-sm text-gray-500 mt-8">
          Use your institute Google account to access the mentorship portal.
        </p>

      </div>
    </div>
  );
}