import { authAPI } from "../lib/api";

export default function Login() {
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
