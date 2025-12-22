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
// Hospital Doctor pages
import HospitalDoctorDashboard from "./pages/hospital-doctor/HospitalDoctorDashboard";
// Online Doctor pages
import OnlineDoctorDashboard from "./pages/online-doctor/OnlineDoctorDashboard";
// Nurse pages
import NurseDashboard from "./pages/nurse/NurseDashboard";
import AddPatient from "./pages/nurse/AddPatient";
// Pharmacist pages
import PharmacistDashboard from "./pages/pharmacist/PharmacistDashboard";
// Legacy Doctor pages (redirect to hospital doctor)
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
import BrowseDoctors from "./pages/patient/BrowseDoctors";
import BookAppointment from "./pages/patient/BookAppointment";
import PatientAppointments from "./pages/patient/PatientAppointments";
import Teleconsultation from "./pages/patient/Teleconsultation";
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
            
            {/* Hospital Doctor routes */}
            <Route path="/hospital-doctor" element={<HospitalDoctorDashboard />} />
            <Route path="/hospital-doctor/patients" element={<DoctorPatients />} />
            <Route path="/hospital-doctor/messages" element={<DoctorMessages />} />
            <Route path="/hospital-doctor/calls" element={<DoctorCalls />} />
            <Route path="/hospital-doctor/alerts" element={<DoctorAlerts />} />
            
            {/* Online Doctor routes */}
            <Route path="/online-doctor" element={<OnlineDoctorDashboard />} />
            <Route path="/online-doctor/patients" element={<DoctorPatients />} />
            <Route path="/online-doctor/messages" element={<DoctorMessages />} />
            <Route path="/online-doctor/calls" element={<DoctorCalls />} />
            
            {/* Nurse routes */}
            <Route path="/nurse" element={<NurseDashboard />} />
            <Route path="/nurse/add-patient" element={<AddPatient />} />
            <Route path="/nurse/patients" element={<DoctorPatients />} />
            <Route path="/nurse/alerts" element={<DoctorAlerts />} />
            
            {/* Pharmacist routes */}
            <Route path="/pharmacist" element={<PharmacistDashboard />} />
            
            {/* Legacy Doctor routes (for backwards compatibility) */}
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
            <Route path="/patient/browse-doctors" element={<BrowseDoctors />} />
            <Route path="/patient/book-appointment/:doctorId" element={<BookAppointment />} />
            <Route path="/patient/appointments" element={<PatientAppointments />} />
            <Route path="/patient/teleconsultation/:consultationId" element={<Teleconsultation />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
