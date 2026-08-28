export default function MainLayout({ children }) {
  return (
    <div
      className="
        min-h-screen
        transition-colors duration-300
      "
      style={{
        background: "var(--bg-main)",
        color: "var(--text-main)",
      }}
    >
      {children}
    </div>
  );
}
