import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { CompressionProvider } from "./CompressionContext";

export default function App() {
  return (
    <CompressionProvider>
      <RouterProvider router={router} />
    </CompressionProvider>
  );
}
