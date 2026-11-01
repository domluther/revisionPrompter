import { Link, Outlet } from "react-router";

export default function Layout() {
  return (
    <>
      <header className="site-header">
        <Link to="/" className="brand">
          Flipped Recall
        </Link>
        <span className="tagline">OCR A-Level Computer Science | H446</span>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
