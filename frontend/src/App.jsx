import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ViewContent from "./pages/ViewContent";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/view/:id" element={<ViewContent />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
