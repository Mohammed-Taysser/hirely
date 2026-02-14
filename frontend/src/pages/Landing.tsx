import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import {
  FileText,
  Building2,
  Mail,
  Sparkles,
  Download,
  Clock,
  Shield,
  Zap,
  Check,
  ArrowRight,
} from "lucide-react";
import heroPattern from "@/assets/hero-pattern.png";

const features = [
  {
    icon: FileText,
    title: "Smart Resume Builder",
    description: "Create stunning resumes with our drag-and-drop editor and live preview.",
  },
  {
    icon: Building2,
    title: "Company Management",
    description: "Track companies and target your applications strategically.",
  },
  {
    icon: Mail,
    title: "Email Scheduling",
    description: "Schedule and automate your resume submissions with delivery tracking.",
  },
  {
    icon: Sparkles,
    title: "AI Suggestions",
    description: "Get intelligent recommendations to improve your resume content.",
  },
  {
    icon: Download,
    title: "Multiple Formats",
    description: "Export your resume as PDF, DOCX, or HTML based on your tier.",
  },
  {
    icon: Shield,
    title: "Secure Storage",
    description: "Your data is encrypted and safely stored in our secure cloud.",
  },
];

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: ["2 Resumes", "PDF Export", "25MB Storage", "Basic Templates"],
    variant: "outline" as const,
    badge: null,
  },
  {
    name: "Pro",
    price: "$12",
    period: "per month",
    description: "For active job seekers",
    features: ["10 Resumes", "PDF & DOCX Export", "100MB Storage", "Email Scheduling", "Premium Templates"],
    variant: "hero" as const,
    badge: "Popular",
  },
  {
    name: "Premium",
    price: "$29",
    period: "per month",
    description: "For professionals",
    features: ["Unlimited Resumes", "All Export Formats", "500MB Storage", "Priority Support", "AI Suggestions", "Custom Branding"],
    variant: "premium" as const,
    badge: "Best Value",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(${heroPattern})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 animate-fade-in">
              <Zap className="h-3 w-3 mr-1" />
              Now with AI-powered suggestions
            </Badge>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground mb-6 animate-slide-up">
              Build Resumes That{" "}
              <span className="text-accent">Get You Hired</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Create professional resumes, manage your job targets, and automate your applications 
              — all in one powerful platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Button variant="hero" size="xl" asChild>
                <Link to="/dashboard">
                  Start Building Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="hero-outline" size="xl" asChild>
                <Link to="/templates">View Templates</Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: "0.4s" }}>
            {[
              { value: "50K+", label: "Resumes Created" },
              { value: "15K+", label: "Users Hired" },
              { value: "500+", label: "Companies" },
              { value: "98%", label: "Satisfaction" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-3xl md:text-4xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              Everything You Need to Land Your Dream Job
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to streamline your job search and help you stand out.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={feature.title} 
                variant="elevated"
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl gradient-accent flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your job search needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <Card 
                key={tier.name}
                variant="elevated"
                className={`relative ${tier.name === "Pro" ? "border-accent ring-2 ring-accent/20" : ""} animate-slide-up`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant={tier.name === "Pro" ? "accent" : "premium"}>{tier.badge}</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className="font-display text-4xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground ml-2">/{tier.period}</span>
                  </div>
                  <CardDescription className="mt-2">{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-accent" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant={tier.variant} className="w-full" asChild>
                    <Link to="/dashboard">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
            Ready to Transform Your Job Search?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
            Join thousands of professionals who landed their dream jobs with Hirely.
          </p>
          <Button 
            size="xl" 
            className="bg-accent-foreground text-primary hover:bg-accent-foreground/90"
            asChild
          >
            <Link to="/dashboard">
              <Clock className="mr-2 h-5 w-5" />
              Start Your Free Trial
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg gradient-accent flex items-center justify-center">
                <FileText className="h-4 w-4 text-accent-foreground" />
              </div>
              <span className="font-display text-lg font-bold">Hirely</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Hirely. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
