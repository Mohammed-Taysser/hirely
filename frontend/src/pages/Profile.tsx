import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  User,
  Mail,
  FileText,
  HardDrive,
  Crown,
  ArrowUpRight,
  Calendar,
} from "lucide-react";
import { mockUserProfile, tierLimits } from "@/data/mockData";

export default function Profile() {
  const tierInfo = tierLimits[mockUserProfile.tier];
  const storagePercent = (mockUserProfile.storageUsed / mockUserProfile.storageLimit) * 100;
  const resumePercent = mockUserProfile.resumeLimit > 0
    ? (mockUserProfile.resumeCount / mockUserProfile.resumeLimit) * 100
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and subscription.
          </p>
        </div>

        {/* User Info Card */}
        <Card variant="default">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl gradient-accent flex items-center justify-center">
                  <User className="h-8 w-8 text-accent-foreground" />
                </div>
                <div>
                  <CardTitle>{mockUserProfile.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4" />
                    {mockUserProfile.email}
                  </CardDescription>
                </div>
              </div>
              <Badge variant={mockUserProfile.tier} className="text-sm px-3 py-1">
                <Crown className="h-3 w-3 mr-1" />
                {mockUserProfile.tier.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Member since {mockUserProfile.createdAt.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </div>
          </CardContent>
        </Card>

        {/* Usage Stats */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Storage Usage */}
          <Card variant="default">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">Storage</CardTitle>
                </div>
                <span className="text-sm text-muted-foreground">
                  {mockUserProfile.storageUsed}MB / {mockUserProfile.storageLimit}MB
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={storagePercent} className="h-2" />
              <p className="text-sm text-muted-foreground mt-3">
                {Math.round(100 - storagePercent)}% storage remaining
              </p>
            </CardContent>
          </Card>

          {/* Resume Usage */}
          <Card variant="default">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">Resumes</CardTitle>
                </div>
                <span className="text-sm text-muted-foreground">
                  {mockUserProfile.resumeCount} / {mockUserProfile.resumeLimit === -1 ? "∞" : mockUserProfile.resumeLimit}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={resumePercent} className="h-2" />
              <p className="text-sm text-muted-foreground mt-3">
                {mockUserProfile.resumeLimit === -1
                  ? "Unlimited resumes"
                  : `${mockUserProfile.resumeLimit - mockUserProfile.resumeCount} resumes remaining`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Current Plan */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Your subscription details and available features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl bg-secondary/50">
                <p className="text-sm text-muted-foreground mb-1">Resume Limit</p>
                <p className="text-2xl font-bold">
                  {tierInfo.resumes === -1 ? "Unlimited" : tierInfo.resumes}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-secondary/50">
                <p className="text-sm text-muted-foreground mb-1">Storage</p>
                <p className="text-2xl font-bold">{tierInfo.storage}MB</p>
              </div>
              <div className="p-4 rounded-xl bg-secondary/50">
                <p className="text-sm text-muted-foreground mb-1">Export Formats</p>
                <p className="text-2xl font-bold">{tierInfo.exports.join(", ")}</p>
              </div>
            </div>

            {mockUserProfile.tier !== "premium" && (
              <div className="mt-6 p-6 rounded-xl gradient-primary text-primary-foreground">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">Upgrade to Premium</h3>
                    <p className="text-primary-foreground/80 text-sm mt-1">
                      Unlock unlimited resumes, all export formats, and AI suggestions.
                    </p>
                  </div>
                  <Button className="bg-accent-foreground text-primary hover:bg-accent-foreground/90 shrink-0">
                    Upgrade Now
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card variant="default" className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible and destructive actions</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="destructive">Delete Account</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
