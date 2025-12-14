import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import StaffManagement from "./pages/admin/StaffManagement";
import AdminPatients from "./pages/admin/AdminPatients";
import AdminAlerts from "./pages/admin/AdminAlerts";
import AdminSettings from "./pages/admin/AdminSettings";
// Doctor pages
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import DoctorMessages from "./pages/doctor/DoctorMessages";
import DoctorCalls from "./pages/doctor/DoctorCalls";
import DoctorAlerts from "./pages/doctor/DoctorAlerts";
// Patient pages
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientVitals from "./pages/patient/PatientVitals";
import PatientMessages from "./pages/patient/PatientMessages";
import PatientContact from "./pages/patient/PatientContact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/staff" element={<StaffManagement />} />
            <Route path="/admin/patients" element={<AdminPatients />} />
            <Route path="/admin/alerts" element={<AdminAlerts />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            
            {/* Doctor routes */}
            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route path="/doctor/patients" element={<DoctorPatients />} />
            <Route path="/doctor/messages" element={<DoctorMessages />} />
            <Route path="/doctor/calls" element={<DoctorCalls />} />
            <Route path="/doctor/alerts" element={<DoctorAlerts />} />
            
            {/* Patient routes */}
            <Route path="/patient" element={<PatientDashboard />} />
            <Route path="/patient/vitals" element={<PatientVitals />} />
            <Route path="/patient/messages" element={<PatientMessages />} />
            <Route path="/patient/contact" element={<PatientContact />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
