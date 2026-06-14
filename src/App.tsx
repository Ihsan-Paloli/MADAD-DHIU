import { Routes, Route, Link, useLocation } from "react-router-dom";
import ResetPassword from "@/routes/reset-password";
import { useEffect } from "react";
import Home from "./routes/index";
import About from "./routes/about";
import Achievements from "./routes/achievements";
import Admin from "./routes/admin";
import Analytics from "./routes/analytics";
import Announcements from "./routes/announcements";
import Auditing from "./routes/auditing";
import Committee from "./routes/committee";
import Contact from "./routes/contact";
import EventsPortal from "./routes/events-portal";
import Events from "./routes/events";
import Feedback from "./routes/feedback";
import Gallery from "./routes/gallery";
import Login from "./routes/login";
import QuickLinks from "./routes/quick-links";
import ResultPage from "./routes/results.$programId";
import Stationery from "./routes/stationery";
import WingSlug from "./routes/wings.$slug";
import WingsIndex from "./routes/wings.index";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/auditing" element={<Auditing />} />
        <Route path="/committee" element={<Committee />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/events-portal" element={<EventsPortal />} />
        <Route path="/events" element={<Events />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/login" element={<Login />} />
        <Route path="/quick-links" element={<QuickLinks />} />
        <Route path="/results/:programId" element={<ResultPage />} />
        <Route path="/stationery" element={<Stationery />} />
        <Route path="/wings" element={<WingsIndex />} />
        <Route path="/wings/:slug" element={<WingSlug />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
