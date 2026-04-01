// frontend/src/App.jsx

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PublicProfilePage from "./pages/PublicProfilePage";
import PublicPostPage from "./pages/PublicPostPage";
import DashboardPage from "./pages/DashboardPage";
import SettingsPage from "./pages/SettingsPage";
import EditPostPage from "./pages/EditPostPage";
import AdminPage from "./components/AdminPage";
import DirectoryPage from "./pages/DirectoryPage";

function App() {
  return (
    <BrowserRouter basename="/blog-app">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/directory" element={<DirectoryPage />} />
        <Route path="/blog/:username" element={<PublicProfilePage />} />
        <Route path="/blog/:username/post/:slug" element={<PublicPostPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/settings" element={<SettingsPage />} />
        <Route path="/dashboard/posts/new" element={<EditPostPage />} />
        <Route path="/dashboard/posts/:id" element={<EditPostPage />} />
        <Route path="/dashboard/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;