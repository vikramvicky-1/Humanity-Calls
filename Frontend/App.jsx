import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import WhatsAppButton from "./components/WhatsAppButton";
import Home from "./pages/Home";

// Lazy load Footer and other pages
const Footer = lazy(() => import("./components/Footer"));
const About = lazy(() => import("./pages/About"));
const RequestDonors = lazy(() => import("./pages/RequestDonors"));
const PoorNeedy = lazy(() => import("./pages/PoorNeedy"));
const AnimalRescue = lazy(() => import("./pages/AnimalRescue"));
const Collaborate = lazy(() => import("./pages/Collaborate"));
const Volunteer = lazy(() => import("./pages/Volunteer"));
const Donate = lazy(() => import("./pages/Donate"));
const WallOfFame = lazy(() => import("./pages/WallOfFame"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Disclaimer = lazy(() => import("./pages/Disclaimer"));
const DonationsMade = lazy(() => import("./pages/DonationsMade"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blood-red"></div>
  </div>
);

// ScrollToTop component to reset scroll on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App = () => {
  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/request-donors" element={<RequestDonors />} />
              <Route path="/poor-needy" element={<PoorNeedy />} />
              <Route path="/animal-rescue" element={<AnimalRescue />} />
              <Route path="/collaborate" element={<Collaborate />} />
              <Route path="/volunteer" element={<Volunteer />} />
              <Route path="/donate" element={<Donate />} />
              <Route path="/wall-of-fame" element={<WallOfFame />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              <Route path="/donations-made" element={<DonationsMade />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
        <WhatsAppButton />
      </div>
    </Router>
  );
};

export default App;
