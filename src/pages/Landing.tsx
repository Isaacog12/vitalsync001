import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Activity,
  Heart,
  Shield,
  Video,
  Pill,
  Users,
  Stethoscope,
  Smartphone,
  Brain,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

const features = [
  {
    icon: Heart,
    title: 'Real-time Vitals',
    description: 'Monitor patient health metrics in real-time with AI-powered insights',
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
  },
  {
    icon: Video,
    title: 'Telemedicine',
    description: 'Connect with patients anywhere through secure video consultations',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-400/10',
  },
  {
    icon: Brain,
    title: 'AI Diagnostics',
    description: 'ARIA AI assistant analyzes health data for early detection',
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
  },
  {
    icon: AlertTriangle,
    title: 'SOS Emergency',
    description: 'One-tap emergency alerts with location sharing',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  {
    icon: Pill,
    title: 'e-Prescriptions',
    description: 'Digital prescriptions with pharmacy integration',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
  {
    icon: Shield,
    title: 'Secure EMR',
    description: 'Encrypted electronic medical records with role-based access',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
];

const roles = [
  {
    icon: Users,
    title: 'Patients',
    description: 'Book appointments, view EMR, consult doctors, pay bills',
    href: '/auth?role=patient',
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    icon: Stethoscope,
    title: 'Hospital Doctors',
    description: 'In-patient & out-patient care, prescribe, admit/discharge',
    href: '/auth?role=hospital_doctor',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    icon: Smartphone,
    title: 'Online Doctors',
    description: 'Teleconsultation, remote prescriptions, set pricing',
    href: '/auth?role=online_doctor',
    gradient: 'from-emerald-500 to-teal-600',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 cyber-grid opacity-20" />
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="p-2 gradient-primary rounded-xl animate-glow">
            <Activity className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-display font-bold text-foreground">VitalSync</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/auth">
            <Button variant="ghost" className="hidden sm:inline-flex">Sign In</Button>
          </Link>
          <Link to="/auth">
            <Button className="gradient-primary text-primary-foreground">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-6 lg:px-12 pt-16 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-pulse-glow">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-primary font-medium">AI-Powered Healthcare Platform</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-display font-bold mb-6 leading-tight">
              <span className="text-foreground">The Future of Healthcare</span>
              <br />
              <span className="text-foreground"> is Here</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Connect patients, doctors, nurses, and pharmacists in one intelligent ecosystem. 
              Real-time monitoring, AI diagnostics, and seamless care coordination.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth?role=patient">
                <Button size="lg" className="gradient-primary text-primary-foreground w-full sm:w-auto">
                  <Heart className="mr-2 h-5 w-5" />
                  I'm a Patient
                </Button>
              </Link>
              <Link to="/auth?role=hospital_doctor">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary/50 hover:bg-primary/10">
                  <Stethoscope className="mr-2 h-5 w-5" />
                  I'm a Healthcare Provider
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
            {[
              { value: '10K+', label: 'Active Patients' },
              { value: '500+', label: 'Doctors' },
              { value: '24/7', label: 'AI Monitoring' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat, index) => (
              <div key={index} className="text-center p-6 rounded-2xl glass-card">
                <div className="text-3xl lg:text-4xl font-display font-bold text-gradient mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 lg:px-12 py-24 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-display font-bold text-foreground mb-4">
              Intelligent Healthcare Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need for modern healthcare delivery, powered by AI
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="glass-card group hover:border-primary/50 transition-all duration-300">
                <CardContent className="p-6">
                  <div className={`inline-flex p-3 rounded-xl ${feature.bgColor} mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="relative z-10 px-6 lg:px-12 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-display font-bold text-foreground mb-4">
              Choose Your Portal
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Access tailored dashboards designed for your role in healthcare
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {roles.map((role, index) => (
              <Link key={index} to={role.href}>
                <Card className="glass-card group hover:border-primary/50 transition-all duration-300 h-full overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${role.gradient}`} />
                  <CardContent className="p-8">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${role.gradient} mb-6`}>
                      <role.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold text-foreground mb-3">{role.title}</h3>
                    <p className="text-muted-foreground mb-6">{role.description}</p>
                    <div className="flex items-center text-primary group-hover:translate-x-2 transition-transform">
                      <span className="font-medium">Get Started</span>
                      <ChevronRight className="h-5 w-5 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Additional roles */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">Also available for:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/auth?role=nurse">
                <Button variant="outline" className="border-primary/30">
                  <Users className="mr-2 h-4 w-4" />
                  Nurses
                </Button>
              </Link>
              <Link to="/auth?role=pharmacist">
                <Button variant="outline" className="border-primary/30">
                  <Pill className="mr-2 h-4 w-4" />
                  Pharmacists
                </Button>
              </Link>
              <Link to="/auth?role=admin">
                <Button variant="outline" className="border-primary/30">
                  <Shield className="mr-2 h-4 w-4" />
                  Administrators
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 lg:px-12 py-24">
        <div className="max-w-4xl mx-auto">
          <Card className="glass-card overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20" />
            <CardContent className="relative p-12 text-center">
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">
                Ready to Transform Healthcare?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of healthcare providers and patients using VitalSync 
                for smarter, faster, and more connected care.
              </p>
              <Link to="/auth">
                <Button size="lg" className="gradient-primary text-primary-foreground">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 lg:px-12 py-8 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-primary" />
            <span className="font-display font-bold">VitalSync</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 VitalSync. AI-Powered Healthcare Platform.
          </p>
        </div>
      </footer>
    </div>
  );
}
