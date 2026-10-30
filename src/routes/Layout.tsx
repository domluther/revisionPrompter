import { Link, Outlet } from "react-router";

export default function Layout() {
  return (
    <>
      <header className="site-header">
        <Link to="/" className="brand">
          Flipped Recall
        </Link>
        <span className="tagline">A-Level Computer Science</span>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
