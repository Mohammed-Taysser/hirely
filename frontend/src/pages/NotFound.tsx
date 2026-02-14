import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileX, Home, ArrowLeft, Search } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Animated 404 illustration */}
        <div className="relative">
          <div className="text-[12rem] font-black text-primary/10 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-full p-8 backdrop-blur-sm border border-primary/20 animate-pulse">
              <FileX className="h-20 w-20 text-primary" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Page Not Found
          </h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            Oops! The page you're looking for seems to have wandered off. 
            Let's get you back on track.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" className="gap-2">
            <Link to="/">
              <Home className="h-5 w-5" />
              Back to Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link to="/dashboard">
              <ArrowLeft className="h-5 w-5" />
              Go to Dashboard
            </Link>
          </Button>
        </div>

        {/* Decorative elements */}
        <div className="pt-8 flex items-center justify-center gap-8 text-muted-foreground/50">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-border" />
          <Search className="h-5 w-5" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-border" />
        </div>

        {/* Helpful links */}
        <div className="text-sm text-muted-foreground">
          <p>Looking for something specific? Try these:</p>
          <div className="flex flex-wrap justify-center gap-4 mt-3">
            <Link to="/resumes" className="text-primary hover:underline">My Resumes</Link>
            <Link to="/templates" className="text-primary hover:underline">Templates</Link>
            <Link to="/features" className="text-primary hover:underline">Features</Link>
            <Link to="/pricing" className="text-primary hover:underline">Pricing</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
