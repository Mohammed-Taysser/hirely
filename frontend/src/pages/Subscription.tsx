import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Crown,
  Sparkles,
  Zap,
  Check,
  CreditCard,
  Calendar,
  ArrowUpRight,
  AlertCircle,
  Mail,
  Bell,
  Coins,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { RedeemPoints } from "@/components/billing/RedeemPoints";

const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    icon: Zap,
    features: ["3 resume templates", "Basic customization", "PDF export", "5 version history"],
    color: "bg-gray-500",
  },
  {
    id: "pro",
    name: "Pro",
    price: 12,
    icon: Sparkles,
    features: [
      "Unlimited templates",
      "Full customization",
      "PDF, DOCX, HTML export",
      "AI suggestions",
      "Cover letter generator",
      "Email scheduling",
    ],
    color: "bg-primary",
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: 29,
    icon: Crown,
    features: [
      "All Pro features",
      "Custom branding",
      "Team collaboration",
      "API access",
      "Advanced analytics",
      "Dedicated support",
    ],
    color: "bg-amber-500",
  },
];

const emailPreferences = [
  { id: "billing", label: "Billing notifications", description: "Payment receipts and reminders" },
  { id: "updates", label: "Product updates", description: "New features and improvements" },
  { id: "tips", label: "Resume tips", description: "Weekly career advice and tips" },
  { id: "marketing", label: "Marketing emails", description: "Special offers and promotions" },
];

export default function Subscription() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentPlan, setCurrentPlan] = useState("pro");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [emailSettings, setEmailSettings] = useState<Record<string, boolean>>({
    billing: true,
    updates: true,
    tips: false,
    marketing: false,
  });
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [userPoints, setUserPoints] = useState(1025);
  const [appliedDiscount, setAppliedDiscount] = useState<{ name: string; value: number } | null>(null);

  const handleRedeem = (reward: { name: string; discountValue: number }) => {
    setAppliedDiscount({ name: reward.name, value: reward.discountValue });
    toast({
      title: "Discount Applied!",
      description: `${reward.name} will be applied to your next billing cycle.`,
    });
  };

  const handlePointsUpdated = (newBalance: number) => {
    setUserPoints(newBalance);
  };

  const currentPlanData = plans.find((p) => p.id === currentPlan);
  const nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const handleUpgrade = (planId: string) => {
    setSelectedPlan(planId);
    setUpgradeDialogOpen(true);
  };

  const confirmUpgrade = () => {
    if (selectedPlan) {
      setCurrentPlan(selectedPlan);
      toast({
        title: "Plan Updated!",
        description: `You've successfully ${
          plans.findIndex((p) => p.id === selectedPlan) > plans.findIndex((p) => p.id === currentPlan)
            ? "upgraded"
            : "changed"
        } to the ${plans.find((p) => p.id === selectedPlan)?.name} plan.`,
      });
      setUpgradeDialogOpen(false);
    }
  };

  const handleCancelSubscription = () => {
    setCurrentPlan("free");
    toast({
      title: "Subscription Cancelled",
      description: "Your subscription has been cancelled. You'll retain access until the end of your billing period.",
      variant: "destructive",
    });
  };

  const handleEmailToggle = (id: string) => {
    setEmailSettings((prev) => ({ ...prev, [id]: !prev[id] }));
    toast({
      title: "Preferences Updated",
      description: `Email notifications ${emailSettings[id] ? "disabled" : "enabled"} for ${id}.`,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold">Subscription</h1>
          <p className="text-muted-foreground mt-1">
            Manage your plan, billing, and email preferences
          </p>
        </div>

        {/* Current Plan Card */}
        <Card className="gradient-primary text-primary-foreground">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-white/20 flex items-center justify-center">
                  {currentPlanData && <currentPlanData.icon className="h-7 w-7" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">{currentPlanData?.name} Plan</h2>
                    {currentPlanData?.popular && (
                      <Badge variant="secondary" className="bg-white/20 text-white">
                        Current
                      </Badge>
                    )}
                  </div>
                  <p className="text-primary-foreground/80 mt-1">
                    ${currentPlanData?.price}/{billingCycle === "monthly" ? "month" : "year"}
                    {appliedDiscount && (
                      <span className="ml-2 text-green-300">
                        (-{appliedDiscount.name})
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-2 text-primary-foreground/80">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    Next billing: {nextBillingDate.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-primary-foreground/80">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-sm">Visa •••• 4242</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loyalty Points Redemption */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-amber-500" />
                <CardTitle>Loyalty Points</CardTitle>
              </div>
              <RedeemPoints
                userPoints={userPoints}
                onRedeem={handleRedeem}
                onPointsUpdated={handlePointsUpdated}
              />
            </div>
            <CardDescription>
              Redeem your loyalty points for billing discounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-500/10 to-amber-600/5 rounded-lg border border-amber-500/20">
              <div>
                <p className="text-sm text-muted-foreground">Your Balance</p>
                <p className="text-2xl font-bold">{userPoints.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">points</span></p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Value</p>
                <p className="text-lg font-semibold text-green-600">≈ ${(userPoints * 0.01).toFixed(2)}</p>
              </div>
            </div>
            {appliedDiscount && (
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Pending discount: {appliedDiscount.name}</span>
                </div>
                <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                  Next billing
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Billing Cycle Toggle */}
        <Card>
          <CardHeader>
            <CardTitle>Billing Cycle</CardTitle>
            <CardDescription>Choose between monthly or yearly billing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Label
                className={billingCycle === "monthly" ? "font-medium" : "text-muted-foreground"}
              >
                Monthly
              </Label>
              <Switch
                checked={billingCycle === "yearly"}
                onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
              />
              <div className="flex items-center gap-2">
                <Label
                  className={billingCycle === "yearly" ? "font-medium" : "text-muted-foreground"}
                >
                  Yearly
                </Label>
                <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                  Save 20%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plans Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = plan.id === currentPlan;
            const price = billingCycle === "yearly" ? Math.floor(plan.price * 0.8 * 12) : plan.price;

            return (
              <Card
                key={plan.id}
                className={`relative ${isCurrent ? "ring-2 ring-primary" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-lg ${plan.color} flex items-center justify-center`}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>
                        ${price}
                        {billingCycle === "yearly" ? "/year" : "/month"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {isCurrent ? (
                    <Button disabled className="w-full" variant="outline">
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={plan.id === "premium" ? "default" : "outline"}
                      onClick={() => handleUpgrade(plan.id)}
                    >
                      {plans.findIndex((p) => p.id === plan.id) >
                      plans.findIndex((p) => p.id === currentPlan)
                        ? "Upgrade"
                        : "Downgrade"}
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Email Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <CardTitle>Email Notifications</CardTitle>
            </div>
            <CardDescription>
              Choose which emails you'd like to receive
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {emailPreferences.map((pref) => (
                <div
                  key={pref.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{pref.label}</p>
                      <p className="text-sm text-muted-foreground">{pref.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={emailSettings[pref.id]}
                    onCheckedChange={() => handleEmailToggle(pref.id)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <CardTitle>Payment Method</CardTitle>
            </div>
            <CardDescription>Manage your payment details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="h-12 w-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                  VISA
                </div>
                <div>
                  <p className="font-medium">•••• •••• •••• 4242</p>
                  <p className="text-sm text-muted-foreground">Expires 12/2025</p>
                </div>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Update</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Payment Method</DialogTitle>
                    <DialogDescription>
                      Enter your new card details below
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="card">Card Number</Label>
                      <Input id="card" placeholder="1234 5678 9012 3456" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Expiry</Label>
                        <Input id="expiry" placeholder="MM/YY" />
                      </div>
                      <div>
                        <Label htmlFor="cvc">CVC</Label>
                        <Input id="cvc" placeholder="123" />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() =>
                        toast({ title: "Card Updated", description: "Your payment method has been updated." })
                      }
                    >
                      Save Card
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        {currentPlan !== "free" && (
          <Card className="border-destructive/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
              </div>
              <CardDescription>
                Irreversible actions for your subscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border border-destructive/30 rounded-lg bg-destructive/5">
                <div>
                  <p className="font-medium">Cancel Subscription</p>
                  <p className="text-sm text-muted-foreground">
                    Your subscription will remain active until the end of the billing period.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Cancel Plan</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to cancel your {currentPlanData?.name} subscription?
                        You'll lose access to premium features at the end of your current billing
                        period.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCancelSubscription}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Yes, Cancel
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Upgrade Dialog */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedPlan &&
                plans.findIndex((p) => p.id === selectedPlan) >
                  plans.findIndex((p) => p.id === currentPlan)
                ? "Upgrade"
                : "Change"}{" "}
              to {plans.find((p) => p.id === selectedPlan)?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedPlan &&
                (plans.findIndex((p) => p.id === selectedPlan) >
                plans.findIndex((p) => p.id === currentPlan)
                  ? "Unlock more features with this upgrade."
                  : "You can always upgrade back anytime.")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <span>New monthly charge</span>
              <span className="text-2xl font-bold">
                ${plans.find((p) => p.id === selectedPlan)?.price || 0}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpgradeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmUpgrade}>Confirm Change</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
