import { createBrowserRouter } from "react-router";
import { Home } from "./components/Home";
import { Questionnaire } from "./components/Questionnaire";
import { DoctorDashboard } from "./components/DoctorDashboard";
import { Analytics } from "./components/Analytics";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/questionnaire",
    Component: Questionnaire,
  },
  {
    path: "/dashboard",
    Component: DoctorDashboard,
  },
  {
    path: "/analytics",
    Component: Analytics,
  },
]);
