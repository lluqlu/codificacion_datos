import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import HomePage from "../pages/HomePage";
import EncodePage from "../pages/EncodePage";
import DecodePage from "../pages/DecodePage";
import ComparePage from "../pages/ComparePage";
import BitmapPage from "../pages/BitmapPage";
import AboutPage from "../pages/AboutPage";
import HistoryPage from "../pages/HistoryPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "codificar", element: <EncodePage /> },
      { path: "decodificar", element: <DecodePage /> },
      { path: "comparar", element: <ComparePage /> },
      { path: "imagenes", element: <BitmapPage /> },
      { path: "acerca", element: <AboutPage /> },
      { path: "historial", element: <HistoryPage /> },
    ],
  },
]);
