import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import Home from "./routes/Home";
import Layout from "./routes/Layout";
import TopicPage from "./routes/TopicPage";
import "./styles.css";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "topic/:id", element: <TopicPage /> },
      { path: "*", element: <Home /> },
    ],
  },
]);

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
