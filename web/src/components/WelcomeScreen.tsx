interface WelcomeScreenProps {
  onStart: () => void;
  loading: boolean;
  error: string | null;
}

export function WelcomeScreen({ onStart, loading, error }: WelcomeScreenProps) {
  return (
    <div className="screen welcome-screen">
      <div
        className="welcome-screen__bg"
        style={{ backgroundImage: "url(/assets/title_splash.png)" }}
        role="img"
        aria-label="Pixel-art dojo with TYPED AWAY scroll"
      />
      <div className="welcome-screen__veil" />

      <div className="scroll-panel welcome-screen__panel animate-unfurl">
        <p className="eyebrow">⚔ Coding Dojo ⚔</p>
        <h1 className="brand-title">
          <span className="brand-title__star">✦</span> TYPED AWAY{" "}
          <span className="brand-title__star">✦</span>
        </h1>
        <p className="brand-tagline">Type. Learn. Conquer.</p>
        <div className="welcome-screen__divider" />
        <p className="welcome-screen__copy">
          Welcome, student. Train your katas.
          <br />
          Spirit Energy: ❤️ ❤️ ❤️ · Belts await.
        </p>
        {error && <p className="error-text">{error}</p>}
        <button
          type="button"
          className="pixel-btn pixel-btn--primary"
          onClick={onStart}
          disabled={loading || !!error}
        >
          {loading ? "Loading scrolls…" : "Begin training ✦"}
        </button>
        <p className="hint-text">Press Enter to begin</p>
      </div>
    </div>
  );
}
