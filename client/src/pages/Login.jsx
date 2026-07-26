import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { authAPI } from "../lib/api";
import { toast } from "../lib/toast";

const ERRORS = {
  unauthorized:
    "This Google account isn’t registered in SAATHI.",
  auth: "Sign-in didn’t finish. Please try again.",
  session: "Signed in, but we couldn’t load your profile. Check API URL / CORS.",
};

export default function Login() {
  const [params] = useSearchParams();
  const error = ERRORS[params.get("error")] || "";

  useEffect(() => {
    if (!error) return;
    // Avoid StrictMode double-toast; keep the inline banner as the main message
    const key = `login-toast:${params.get("error")}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    toast.error(error);
  }, [error, params]);

  return (
    <div className="landing">
      <div className="landing__glow landing__glow--a" aria-hidden="true" />
      <div className="landing__glow landing__glow--b" aria-hidden="true" />
      <div className="landing__grain" aria-hidden="true" />

      <main className="landing__stage">
        <div className="landing__brand">
          <img
            src="/saathi-logo.png"
            alt="SAATHI"
            className="landing__logo"
          />
        </div>

        <div className="landing__copy">
          <p className="landing__eyebrow">IIT Madras</p>
          <h1 className="landing__headline">
            A friend for the journey
          </h1>
          <p className="landing__support">
            You’re not meant to figure it all out alone.
          </p>

          {error ? <p className="landing__error">{error}</p> : null}

          <button
            type="button"
            onClick={authAPI.googleLogin}
            className="landing__cta"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt=""
              className="landing__cta-icon"
            />
            Sign in
          </button>
        </div>
      </main>
    </div>
  );
}
