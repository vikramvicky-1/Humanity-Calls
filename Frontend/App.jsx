import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserProvider } from "./context/UserContext";
import Navbar from "./components/Navbar";
import ContactFloatingButton from "./components/WhatsAppButton";
import SmoothScroll from "./components/SmoothScroll";
import Home from "./pages/Home";


// Lazy load Footer and other pages
const Footer = lazy(() => import("./components/Footer"));
const About = lazy(() => import("./pages/About"));
const RequestDonors = lazy(() => import("./pages/RequestDonors"));
const BloodForms = lazy(() => import("./pages/BloodForms"));
const PoorNeedy = lazy(() => import("./pages/PoorNeedy"));
const AnimalRescue = lazy(() => import("./pages/AnimalRescue"));
const Collaborate = lazy(() => import("./pages/Collaborate"));
const Volunteer = lazy(() => import("./pages/Volunteer"));
const OurTeam = lazy(() => import("./pages/OurTeam"));
const Donate = lazy(() => import("./pages/Donate"));
const BloodDonation = lazy(() => import("./pages/BloodDonation"));
const WallOfFame = lazy(() => import("./pages/WallOfFame"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Disclaimer = lazy(() => import("./pages/Disclaimer"));
const DonationsMade = lazy(() => import("./pages/DonationsMade"));
const BecomeAMember = lazy(() => import("./pages/BecomeAMember"));
const ProgramDetail = lazy(() => import("./pages/ProgramDetail"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const VolunteersManager = lazy(() => import("./pages/admin/VolunteersManager"));
const GalleryManager = lazy(() => import("./pages/admin/GalleryManager"));
const RequestsManager = lazy(() => import("./pages/admin/RequestsManager"));
const FormsManager = lazy(() => import("./pages/admin/FormsManager"));
const EmailManager = lazy(() => import("./pages/admin/EmailManager"));
const AddGalleryManager = lazy(() => import("./pages/admin/AddGalleryManager"));
const FormImagesManager = lazy(() => import("./pages/admin/FormImagesManager"));
const BloodRequestsManager = lazy(() => import("./pages/admin/BloodRequestsManager"));
const ReimbursementsManager = lazy(() => import("./pages/admin/ReimbursementsManager"));
const Verify = lazy(() => import("./pages/Verify"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// ScrollToTop component to reset scroll on route change or handle hash links
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  
  React.useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.slice(1));
      if (element) {
        // Delay slightly to ensure the page has rendered
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  
  return null;
};

const App = () => {
  return (
    <UserProvider>
      <Router>
        <SmoothScroll>
        <ToastContainer theme="dark" position="top-center" />
        <ScrollToTop />
        <AppContent />
        </SmoothScroll>
      </Router>
    </UserProvider>
  );
};

const AppContent = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminPage && <Navbar />}
      <main className="flex-grow">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/our-team" element={<OurTeam />} />
            <Route path="/blood" element={<BloodForms />} />
            <Route path="/request-donors" element={<RequestDonors />} />
            <Route path="/poor-needy" element={<PoorNeedy />} />
            <Route path="/animal-rescue" element={<AnimalRescue />} />
            <Route path="/collaborate" element={<Collaborate />} />
            <Route path="/volunteer" element={<Volunteer />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/blood-donation" element={<BloodDonation />} />
            <Route path="/wall-of-fame" element={<WallOfFame />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
            <Route path="/donations-made" element={<DonationsMade />} />
            <Route path="/become-a-member" element={<BecomeAMember />} />
            <Route path="/programs/:id" element={<ProgramDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />}>
              <Route index element={<Navigate to="volunteers" replace />} />
              <Route path="volunteers" element={<VolunteersManager />} />
              <Route path="gallery" element={<GalleryManager />} />
              <Route path="requests" element={<RequestsManager />} />
              <Route path="forms" element={<FormsManager />} />
              <Route path="blood-requests" element={<BloodRequestsManager />} />
              <Route path="reimbursements" element={<ReimbursementsManager />} />
              <Route path="send-mails" element={<EmailManager />} />
              <Route path="add-gallery" element={<AddGalleryManager />} />
              <Route path="form-images" element={<FormImagesManager />} />
            </Route>
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verify/:volunteerId" element={<Verify />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      {!isAdminPage && (
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      )}
      {!isAdminPage && <ContactFloatingButton />}
    </div>
  );
};

export default App;
