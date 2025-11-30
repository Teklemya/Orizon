import { Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";

import Dashboard from "./pages/Dashboard";
import EssayStudio from "./pages/EssayStudio";
import CommunityQA from "./pages/CommunityQA";
import Login from "./pages/Login";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* default -> Explore/Dashboard */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/explore" element={<Dashboard />} />

        <Route path="/essay-studio" element={<EssayStudio />} />
        <Route path="/community" element={<CommunityQA />} />
        <Route path="/login" element={<Login />} />

        {/* fallback */}
        <Route path="*" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}
