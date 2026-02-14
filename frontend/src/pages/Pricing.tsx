import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Check, Sparkles, Zap, Crown, HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started with basic resume building.",
    icon: Zap,
    features: [
      "3 resume templates",
      "Basic customization",
      "PDF export",
      "Resume analysis",
      "Version history (5 versions)",
    ],
    notIncluded: [
      "AI suggestions",
      "Cover letter generator",
      "DOCX/HTML export",
      "Priority support",
    ],
    buttonText: "Get Started",
    buttonVariant: "outline" as const,
    popular: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "per month",
    description: "Best for active job seekers who want to stand out.",
    icon: Sparkles,
    features: [
      "All Free features",
      "Unlimited templates",
      "Full customization",
      "PDF, DOCX, HTML export",
      "AI-powered suggestions",
      "Cover letter generator",
      "Unlimited version history",
      "Email scheduling",
      "Company tracking",
      "Priority support",
    ],
    notIncluded: [],
    buttonText: "Start Pro Trial",
    buttonVariant: "default" as const,
    popular: true,
  },
  {
    name: "Premium",
    price: "$29",
    period: "per month",
    description: "For professionals and teams who need the best.",
    icon: Crown,
    features: [
      "All Pro features",
      "Custom branding",
      "Team collaboration",
      "API access",
      "Advanced analytics",
      "Dedicated account manager",
      "Custom integrations",
      "White-label options",
    ],
    notIncluded: [],
    buttonText: "Contact Sales",
    buttonVariant: "secondary" as const,
    popular: false,
  },
];

const faqs = [
  {
    question: "Can I try Pro features before subscribing?",
    answer: "Yes! We offer a 14-day free trial of Pro features. No credit card required to start your trial.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Absolutely. You can cancel your subscription at any time. Your access will continue until the end of your billing period.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and bank transfers for annual plans. Enterprise customers can also pay via invoice.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we use industry-standard encryption and security practices. Your data is stored securely and never shared with third parties.",
  },
  {
    question: "Can I switch plans later?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.",
  },
  {
    question: "Do you offer discounts for students or non-profits?",
    answer: "Yes! We offer 50% off for students with a valid .edu email and special pricing for non-profit organizations. Contact us for details.",
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-4">
            Simple Pricing
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start for free and upgrade when you need more. No hidden fees, no surprises.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <Card 
                key={index} 
                className={`relative flex flex-col ${
                  tier.popular 
                    ? "border-primary shadow-lg shadow-primary/20 scale-105" 
                    : "border-border"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="px-4 py-1">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <div className={`mx-auto p-3 rounded-xl bg-muted w-fit mb-4 ${
                    tier.popular ? "bg-primary/10" : ""
                  }`}>
                    <tier.icon className={`h-8 w-8 ${tier.popular ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription className="text-base">{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="text-center mb-6">
                    <span className="text-5xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground ml-2">/{tier.period}</span>
                  </div>
                  <ul className="space-y-3">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                    {tier.notIncluded.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-muted-foreground/50">
                        <Check className="h-5 w-5 shrink-0 mt-0.5" />
                        <span className="text-sm line-through">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full" variant={tier.buttonVariant} size="lg">
                    <Link to="/auth">{tier.buttonText}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison note */}
      <section className="py-12 px-4 bg-muted/30 border-y">
        <div className="container mx-auto text-center max-w-2xl">
          <p className="text-muted-foreground">
            All plans include access to our core resume builder. 
            Upgrade anytime to unlock AI features, more templates, and advanced tools.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <HelpCircle className="h-10 w-10 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">
              Have questions? We've got answers.
            </p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of job seekers who trust us to help them land their dream jobs.
          </p>
          <Button asChild size="lg">
            <Link to="/auth">Start Free Today</Link>
          </Button>
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
