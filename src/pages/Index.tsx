import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Landing from './Landing';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && role) {
      // Route based on role
      switch (role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'doctor':
        case 'hospital_doctor':
          navigate('/hospital-doctor');
          break;
        case 'online_doctor':
          navigate('/online-doctor');
          break;
        case 'nurse':
          navigate('/nurse');
          break;
        case 'pharmacist':
          navigate('/pharmacist');
          break;
        case 'patient':
          navigate('/patient');
          break;
        default:
          break;
      }
    }
  }, [user, role, loading, navigate]);

  // If loading, show spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If logged in, show loading while redirecting
  if (user && role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show landing page for non-authenticated users
  return <Landing />;
};

export default Index;
