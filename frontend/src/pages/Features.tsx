import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  FileText,
  Wand2,
  Palette,
  Download,
  History,
  Users,
  Mail,
  Shield,
  Zap,
  LayoutTemplate,
  GripVertical,
  Sparkles,
  Brain,
  PenTool,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Professional Templates",
    description: "Choose from a wide variety of professionally designed resume templates that stand out to recruiters.",
    badge: "Popular",
    color: "text-blue-500",
  },
  {
    icon: Wand2,
    title: "AI-Powered Suggestions",
    description: "Get intelligent recommendations to improve your resume content based on job descriptions.",
    badge: "AI",
    color: "text-purple-500",
  },
  {
    icon: Brain,
    title: "Cover Letter Generator",
    description: "Automatically generate tailored cover letters that match your resume and target job.",
    badge: "AI",
    color: "text-pink-500",
  },
  {
    icon: Palette,
    title: "Full Customization",
    description: "Customize colors, fonts, spacing, and layouts to create your perfect resume design.",
    badge: null,
    color: "text-orange-500",
  },
  {
    icon: GripVertical,
    title: "Drag & Drop Sections",
    description: "Easily reorder resume sections with intuitive drag and drop functionality.",
    badge: null,
    color: "text-green-500",
  },
  {
    icon: Download,
    title: "Multiple Export Formats",
    description: "Export your resume in PDF, DOCX, or HTML format for any application requirement.",
    badge: null,
    color: "text-cyan-500",
  },
  {
    icon: History,
    title: "Version History",
    description: "Track all changes and restore previous versions of your resume at any time.",
    badge: "Pro",
    color: "text-amber-500",
  },
  {
    icon: Sparkles,
    title: "Resume Analysis",
    description: "Get a detailed analysis of your resume with actionable improvement suggestions.",
    badge: null,
    color: "text-rose-500",
  },
  {
    icon: Mail,
    title: "Email Scheduling",
    description: "Schedule and track resume submissions to companies directly from the platform.",
    badge: "Pro",
    color: "text-indigo-500",
  },
  {
    icon: Users,
    title: "Company Tracking",
    description: "Keep track of companies you've applied to and manage your job search efficiently.",
    badge: null,
    color: "text-teal-500",
  },
  {
    icon: PenTool,
    title: "Rich Text Editor",
    description: "Format your content with a powerful rich text editor supporting bullets, links, and more.",
    badge: null,
    color: "text-violet-500",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your data is encrypted and stored securely. We never share your information.",
    badge: null,
    color: "text-emerald-500",
  },
];

const highlights = [
  "No credit card required to start",
  "Export unlimited resumes",
  "Access to all templates",
  "AI-powered improvements",
  "24/7 customer support",
];

export default function Features() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-4">
            <Zap className="h-3 w-3 mr-1" />
            Powerful Features
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Everything You Need to Land Your Dream Job
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Our comprehensive suite of tools helps you create professional resumes, 
            generate cover letters, and manage your entire job search process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="gap-2">
              <Link to="/auth">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/templates">View Templates</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-8 border-y bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 md:gap-12">
            {highlights.map((highlight, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                {highlight}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl bg-muted ${feature.color}`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    {feature.badge && (
                      <Badge variant={feature.badge === "AI" ? "default" : "secondary"}>
                        {feature.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl mt-4">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto text-center max-w-3xl">
          <LayoutTemplate className="h-12 w-12 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Build Your Perfect Resume?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of job seekers who have landed their dream jobs using our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/auth">Start Building Now</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ResumeBuilder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
