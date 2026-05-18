// frontend/src/App.jsx

import { useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import HomePage from "./pages/HomePage";
import PublicProfilePage from "./pages/PublicProfilePage";
import PublicPostPage from "./pages/PublicPostPage";
import DashboardPage from "./pages/DashboardPage";
import SettingsPage from "./pages/SettingsPage";
import EditPostPage from "./pages/EditPostPage";
import AdminPage from "./components/AdminPage";
import DirectoryPage from "./pages/DirectoryPage";
import MediaLibraryPage from "./pages/MediaLibraryPage";
import PostGalleryPage from "./pages/PostGalleryPage";
import EditPostGalleryPage from "./pages/EditPostGalleryPage";

function VisitTracker() {
  const location = useLocation();

  useEffect(() => {
    const visitorIdKey = "blog_app_visitor_id";

    let visitorId = localStorage.getItem(visitorIdKey);
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem(visitorIdKey, visitorId);
    }

    fetch("/blog-app/api/visits", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        visitorId,
        path: window.location.pathname + window.location.search,
        title: document.title,
        referrer: document.referrer || null,
      }),
    }).catch(() => {});
  }, [location.pathname, location.search]);

  return null;
}

function App() {
  return (
    <BrowserRouter basename="/blog-app">
      <VisitTracker />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/directory" element={<DirectoryPage />} />
        <Route path="/blog/:username" element={<PublicProfilePage />} />
        <Route path="/blog/:username/post/:slug" element={<PublicPostPage />} />

        <Route
          path="/blog/:username/post/:slug/gallery"
          element={<PostGalleryPage />}
        />

        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/settings" element={<SettingsPage />} />
        <Route path="/dashboard/posts/new" element={<EditPostPage />} />
        <Route path="/dashboard/posts/:id" element={<EditPostPage />} />

        <Route
          path="/dashboard/posts/:id/gallery"
          element={<EditPostGalleryPage />}
        />

        <Route path="/dashboard/admin" element={<AdminPage />} />
        <Route path="/media" element={<MediaLibraryPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;