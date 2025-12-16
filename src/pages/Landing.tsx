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
  Zap,
  Globe,
  Lock,
  Sparkles,
} from 'lucide-react';

const features = [
  {
    icon: Heart,
    title: 'Real-time Vitals',
    description: 'Monitor patient health metrics in real-time with AI-powered insights',
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
  },
  {
    icon: Video,
    title: 'Telemedicine',
    description: 'Connect with patients anywhere through secure video consultations',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-400/10',
    borderColor: 'border-cyan-400/30',
  },
  {
    icon: Brain,
    title: 'AI Diagnostics',
    description: 'ARIA AI assistant analyzes health data for early detection',
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
  },
  {
    icon: AlertTriangle,
    title: 'SOS Emergency',
    description: 'One-tap emergency alerts with location sharing',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
  {
    icon: Pill,
    title: 'e-Prescriptions',
    description: 'Digital prescriptions with pharmacy integration',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
  },
  {
    icon: Shield,
    title: 'Secure EMR',
    description: 'Encrypted electronic medical records with role-based access',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
];

const roles = [
  {
    icon: Users,
    title: 'Patients',
    description: 'Book appointments, view EMR, consult doctors, pay bills',
    href: '/auth?role=patient',
    gradient: 'from-cyan-500 to-blue-600',
    shadowColor: 'shadow-cyan-500/20',
  },
  {
    icon: Stethoscope,
    title: 'Hospital Doctors',
    description: 'In-patient & out-patient care, prescribe, admit/discharge',
    href: '/auth?role=hospital_doctor',
    gradient: 'from-violet-500 to-purple-600',
    shadowColor: 'shadow-violet-500/20',
  },
  {
    icon: Smartphone,
    title: 'Online Doctors',
    description: 'Teleconsultation, remote prescriptions, set pricing',
    href: '/auth?role=online_doctor',
    gradient: 'from-emerald-500 to-teal-600',
    shadowColor: 'shadow-emerald-500/20',
  },
];

const stats = [
  { value: '10K+', label: 'Active Patients', icon: Users },
  { value: '500+', label: 'Verified Doctors', icon: Stethoscope },
  { value: '24/7', label: 'AI Monitoring', icon: Brain },
  { value: '99.9%', label: 'System Uptime', icon: Zap },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Animated background elements */}
      <div className="fixed inset-0 cyber-grid opacity-30" />
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      {/* Glowing orbs */}
      <div className="glow-orb glow-orb-1" />
      <div className="glow-orb glow-orb-2" />
      <div className="glow-orb glow-orb-3" />
      
      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4 lg:px-12 backdrop-blur-sm border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="p-2 gradient-primary rounded-xl animate-glow shadow-glow">
            <Activity className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-display font-bold text-foreground">VitalSync</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/auth">
            <Button variant="ghost" className="hidden sm:inline-flex hover:bg-primary/10 hover:text-primary transition-colors">
              Sign In
            </Button>
          </Link>
          <Link to="/auth">
            <Button className="gradient-primary text-primary-foreground shadow-glow hover:shadow-neon transition-all duration-300">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-6 lg:px-12 pt-20 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/30 mb-10 animate-slide-up shadow-glow">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm text-primary font-semibold tracking-wide">AI-Powered Healthcare Platform</span>
            </div>
            
            {/* Main heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-display font-bold mb-8 leading-[1.1] animate-slide-up stagger-1">
              <span className="text-foreground">The Future of</span>
              <br />
              <span className="text-gradient-hero">Healthcare</span>
              <span className="text-foreground"> is Here</span>
            </h1>
            
            {/* Subheading */}
            <p className="text-xl lg:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-up stagger-2">
              Connect patients, doctors, nurses, and pharmacists in one intelligent ecosystem. 
              <span className="text-foreground font-medium"> Real-time monitoring</span>, 
              <span className="text-foreground font-medium"> AI diagnostics</span>, and 
              <span className="text-foreground font-medium"> seamless care coordination</span>.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up stagger-3">
              <Link to="/auth?role=patient">
                <Button size="lg" className="gradient-primary text-primary-foreground w-full sm:w-auto h-14 px-8 text-lg shadow-glow hover:shadow-neon transition-all duration-300 hover:scale-105">
                  <Heart className="mr-2 h-5 w-5" />
                  I'm a Patient
                </Button>
              </Link>
              <Link to="/auth?role=hospital_doctor">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg border-primary/50 hover:bg-primary/10 hover:border-primary hover:shadow-glow transition-all duration-300">
                  <Stethoscope className="mr-2 h-5 w-5" />
                  I'm a Healthcare Provider
                </Button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-8 mt-12 animate-slide-up stagger-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Lock className="h-4 w-4 text-primary" />
                <span className="text-sm">HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm">256-bit Encryption</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe className="h-4 w-4 text-primary" />
                <span className="text-sm">Global Access</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-24">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center p-6 rounded-2xl glass-card animate-slide-up group hover:border-primary/50 transition-all duration-300"
                style={{ animationDelay: `${0.5 + index * 0.1}s` }}
              >
                <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-4xl lg:text-5xl font-display font-bold text-gradient mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 lg:px-12 py-32 bg-card/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
              Features
            </span>
            <h2 className="text-4xl lg:text-6xl font-display font-bold text-foreground mb-6">
              Intelligent Healthcare
              <br />
              <span className="text-gradient">Features</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need for modern healthcare delivery, powered by cutting-edge AI
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className={`glass-card group hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-glow overflow-hidden`}
              >
                <CardContent className="p-8">
                  <div className={`inline-flex p-4 rounded-2xl ${feature.bgColor} border ${feature.borderColor} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`h-7 w-7 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-display font-semibold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="relative z-10 px-6 lg:px-12 py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
              Portals
            </span>
            <h2 className="text-4xl lg:text-6xl font-display font-bold text-foreground mb-6">
              Choose Your
              <br />
              <span className="text-gradient">Portal</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Access tailored dashboards designed specifically for your role in healthcare
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {roles.map((role, index) => (
              <Link key={index} to={role.href}>
                <Card className={`glass-card group hover:border-primary/50 transition-all duration-500 h-full overflow-hidden hover:-translate-y-3 hover:${role.shadowColor} hover:shadow-2xl`}>
                  <div className={`h-1.5 bg-gradient-to-r ${role.gradient}`} />
                  <CardContent className="p-10">
                    <div className={`inline-flex p-5 rounded-2xl bg-gradient-to-r ${role.gradient} mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <role.icon className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-display font-bold text-foreground mb-4">{role.title}</h3>
                    <p className="text-muted-foreground mb-8 leading-relaxed">{role.description}</p>
                    <div className="flex items-center text-primary font-semibold group-hover:translate-x-3 transition-transform duration-300">
                      <span>Get Started</span>
                      <ChevronRight className="h-5 w-5 ml-2" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Additional roles */}
          <div className="mt-16 text-center">
            <p className="text-muted-foreground mb-6 text-lg">Also available for:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/auth?role=nurse">
                <Button variant="outline" size="lg" className="border-primary/30 hover:border-primary hover:bg-primary/10 transition-all duration-300">
                  <Users className="mr-2 h-5 w-5" />
                  Nurses
                </Button>
              </Link>
              <Link to="/auth?role=pharmacist">
                <Button variant="outline" size="lg" className="border-primary/30 hover:border-primary hover:bg-primary/10 transition-all duration-300">
                  <Pill className="mr-2 h-5 w-5" />
                  Pharmacists
                </Button>
              </Link>
              <Link to="/auth?role=admin">
                <Button variant="outline" size="lg" className="border-primary/30 hover:border-primary hover:bg-primary/10 transition-all duration-300">
                  <Shield className="mr-2 h-5 w-5" />
                  Administrators
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 lg:px-12 py-32">
        <div className="max-w-5xl mx-auto">
          <Card className="glass-card overflow-hidden border-primary/20">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10" />
            <div className="absolute inset-0 cyber-grid-dense opacity-20" />
            <CardContent className="relative p-16 text-center">
              <div className="inline-flex p-4 rounded-full bg-primary/10 mb-8 animate-pulse-ring">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
                Ready to Transform
                <br />
                <span className="text-gradient">Healthcare?</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                Join thousands of healthcare providers and patients using VitalSync 
                for smarter, faster, and more connected care.
              </p>
              <Link to="/auth">
                <Button size="lg" className="gradient-primary text-primary-foreground h-14 px-10 text-lg shadow-glow hover:shadow-neon transition-all duration-300 hover:scale-105">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 lg:px-12 py-10 border-t border-border/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 gradient-primary rounded-lg">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg">VitalSync</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Contact</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 VitalSync. AI-Powered Healthcare Platform.
          </p>
        </div>
      </footer>
    </div>
  );
}