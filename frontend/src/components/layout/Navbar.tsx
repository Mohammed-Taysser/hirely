import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg gradient-accent flex items-center justify-center shadow-md">
            <FileText className="h-5 w-5 text-accent-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">Hirely</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
          <Link to="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link to="/templates" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Templates
          </Link>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
          <Button variant="hero" asChild>
            <Link to="/auth">Get Started</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </nav>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden border-t border-border bg-background transition-all duration-300 overflow-hidden",
          mobileMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="container mx-auto px-4 py-4 space-y-3">
          <Link to="/features" className="block text-sm font-medium text-muted-foreground hover:text-foreground">
            Features
          </Link>
          <Link to="/pricing" className="block text-sm font-medium text-muted-foreground hover:text-foreground">
            Pricing
          </Link>
          <Link to="/templates" className="block text-sm font-medium text-muted-foreground hover:text-foreground">
            Templates
          </Link>
          <div className="pt-3 flex flex-col gap-2">
            <Button variant="outline" asChild className="w-full">
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button variant="hero" asChild className="w-full">
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
