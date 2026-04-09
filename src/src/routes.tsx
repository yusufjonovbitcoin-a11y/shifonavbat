import { createBrowserRouter, Outlet } from "react-router";
import { Home } from "./components/Home";
import { Questionnaire } from "./components/Questionnaire";
import { GynecologyQuestionnaire } from "./components/GynecologyQuestionnaire";
import { DoctorDashboard } from "./components/DoctorDashboard";
import { Analytics } from "./components/Analytics";
import { RouteErrorPage } from "./components/RouteErrorPage";
import { NotFoundPage } from "./components/NotFoundPage";

function RootLayout() {
  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, Component: Home },
      { path: "questionnaire", Component: Questionnaire },
      { path: "questionnaire-gynecology", Component: GynecologyQuestionnaire },
      { path: "dashboard", Component: DoctorDashboard },
      { path: "analytics", Component: Analytics },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);
