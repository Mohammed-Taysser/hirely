import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Copy,
  Share2,
  Users,
  Gift,
  Coins,
  Check,
  Mail,
  Link2,
  Twitter,
  Linkedin,
  Crown,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ReferralLeaderboard } from "@/components/referrals/ReferralLeaderboard";
import { ReferralTierRewards } from "@/components/referrals/ReferralTierRewards";
import { EmailDigestSettings } from "@/components/referrals/EmailDigestSettings";
import { ReferralAnalytics } from "@/components/referrals/ReferralAnalytics";

interface Referral {
  id: string;
  email: string;
  name: string;
  status: 'pending' | 'signed_up' | 'subscribed';
  pointsEarned: number;
  referredAt: Date;
  convertedAt?: Date;
}

// Mock referral data
const mockReferrals: Referral[] = [
  { 
    id: 'r1', 
    email: 'john@example.com', 
    name: 'John Smith',
    status: 'subscribed', 
    pointsEarned: 500, 
    referredAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    convertedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
  },
  { 
    id: 'r2', 
    email: 'sarah@example.com', 
    name: 'Sarah Johnson',
    status: 'signed_up', 
    pointsEarned: 250, 
    referredAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    convertedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  },
  { 
    id: 'r3', 
    email: 'mike@example.com', 
    name: 'Mike Wilson',
    status: 'pending', 
    pointsEarned: 0, 
    referredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  { 
    id: 'r4', 
    email: 'lisa@example.com', 
    name: 'Lisa Davis',
    status: 'subscribed', 
    pointsEarned: 500, 
    referredAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    convertedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
  },
];

const tierBonuses = {
  free: { base: 250, subscription: 500 },
  pro: { base: 375, subscription: 750 },
  premium: { base: 500, subscription: 1000 },
};

const milestones = [
  { count: 3, reward: 500, label: '3 Referrals' },
  { count: 5, reward: 1000, label: '5 Referrals' },
  { count: 10, reward: 2500, label: '10 Referrals' },
  { count: 25, reward: 7500, label: '25 Referrals' },
];

export default function Referrals() {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState(mockReferrals);
  const [emailInput, setEmailInput] = useState("");
  const [copied, setCopied] = useState(false);

  const userTier = user?.tier || 'free';
  const bonuses = tierBonuses[userTier];
  
  // Generate unique referral code
  const referralCode = user?.id ? `HIRE${user.id.slice(0, 6).toUpperCase()}` : 'HIRE123ABC';
  const referralLink = `https://hirely.app/signup?ref=${referralCode}`;

  const totalEarned = referrals.reduce((sum, r) => sum + r.pointsEarned, 0);
  const successfulReferrals = referrals.filter(r => r.status !== 'pending').length;
  const subscribedReferrals = referrals.filter(r => r.status === 'subscribed').length;

  // Calculate milestone progress
  const currentMilestone = milestones.find(m => m.count > successfulReferrals) || milestones[milestones.length - 1];
  const previousMilestoneCount = milestones.find(m => m.count <= successfulReferrals)?.count || 0;
  const milestoneProgress = currentMilestone 
    ? ((successfulReferrals - previousMilestoneCount) / (currentMilestone.count - previousMilestoneCount)) * 100
    : 100;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success("Referral code copied!");
  };

  const handleEmailInvite = () => {
    if (!emailInput || !emailInput.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    // Simulate sending invitation
    toast.success(`Invitation sent to ${emailInput}!`);
    setEmailInput("");
    
    // Add pending referral
    const newReferral: Referral = {
      id: `r${Date.now()}`,
      email: emailInput,
      name: emailInput.split('@')[0],
      status: 'pending',
      pointsEarned: 0,
      referredAt: new Date(),
    };
    setReferrals(prev => [newReferral, ...prev]);
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(`I'm loving Hirely for creating professional resumes! Join me and get started for free: ${referralLink}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(referralLink);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Check out Hirely - Professional Resume Builder');
    const body = encodeURIComponent(`Hey!\n\nI've been using Hirely to create professional resumes and thought you might find it useful too.\n\nSign up with my referral link and we'll both earn bonus points: ${referralLink}\n\nBest regards`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const getStatusBadge = (status: Referral['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'signed_up':
        return <Badge variant="default" className="bg-blue-500">Signed Up</Badge>;
      case 'subscribed':
        return <Badge variant="default" className="bg-green-500">Subscribed</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Referral Program
          </h1>
          <p className="text-muted-foreground mt-1">
            Invite friends and earn bonus points for every successful referral
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{referrals.length}</p>
                  <p className="text-sm text-muted-foreground">Total Invited</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{successfulReferrals}</p>
                  <p className="text-sm text-muted-foreground">Successful</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Crown className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{subscribedReferrals}</p>
                  <p className="text-sm text-muted-foreground">Subscribed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Coins className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalEarned.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Points Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link Card */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Your Referral Link
            </CardTitle>
            <CardDescription>
              Share this link with friends to earn points when they sign up
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={referralLink}
                readOnly
                className="font-mono text-sm"
              />
              <Button onClick={copyReferralLink} className="shrink-0">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <span className="text-sm text-muted-foreground">Your Code:</span>
                <code className="font-mono font-bold">{referralCode}</code>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyReferralCode}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={shareOnTwitter}>
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Button>
              <Button variant="outline" size="sm" onClick={shareOnLinkedIn}>
                <Linkedin className="h-4 w-4 mr-2" />
                LinkedIn
              </Button>
              <Button variant="outline" size="sm" onClick={shareViaEmail}>
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Email Invite */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Invite via Email
            </CardTitle>
            <CardDescription>
              Send a direct invitation to your friends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="friend@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEmailInvite()}
              />
              <Button onClick={handleEmailInvite}>
                <Share2 className="h-4 w-4 mr-2" />
                Send Invite
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Rewards Info */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium">Share Your Link</p>
                  <p className="text-sm text-muted-foreground">
                    Send your unique referral link to friends and colleagues
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium">Friend Signs Up</p>
                  <p className="text-sm text-muted-foreground">
                    Earn {bonuses.base} points when they create an account
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium">Friend Subscribes</p>
                  <p className="text-sm text-muted-foreground">
                    Earn {bonuses.subscription} bonus points when they upgrade
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Milestone Rewards
              </CardTitle>
              <CardDescription>
                Earn bonus points when you hit referral milestones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {milestones.map((milestone) => {
                const achieved = successfulReferrals >= milestone.count;
                return (
                  <div
                    key={milestone.count}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      achieved ? 'bg-green-500/10 border-green-500/30' : 'bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {achieved ? (
                        <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-sm font-bold">{milestone.count}</span>
                        </div>
                      )}
                      <span className={`font-medium ${achieved ? 'text-green-600' : ''}`}>
                        {milestone.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 font-semibold text-amber-600">
                      <Coins className="h-4 w-4" />
                      +{milestone.reward}
                    </div>
                  </div>
                );
              })}

              {currentMilestone && successfulReferrals < currentMilestone.count && (
                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{successfulReferrals} referrals</span>
                    <span>{currentMilestone.count} referrals</span>
                  </div>
                  <Progress value={milestoneProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-2">
                    {currentMilestone.count - successfulReferrals} more to unlock +{currentMilestone.reward} points
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Referral History */}
        <Card>
          <CardHeader>
            <CardTitle>Referral History</CardTitle>
            <CardDescription>Track the status of your referrals</CardDescription>
          </CardHeader>
          <CardContent>
            {referrals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No referrals yet. Share your link to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {referrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <span className="font-semibold text-sm">
                          {referral.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{referral.name}</p>
                        <p className="text-sm text-muted-foreground">{referral.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        {referral.pointsEarned > 0 && (
                          <div className="flex items-center gap-1 text-amber-600 font-semibold">
                            <Coins className="h-4 w-4" />
                            +{referral.pointsEarned}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {referral.referredAt.toLocaleDateString()}
                        </p>
                      </div>
                      {getStatusBadge(referral.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analytics Dashboard */}
        <ReferralAnalytics />

        {/* Leaderboard */}
        <ReferralLeaderboard />

        {/* Tier Rewards */}
        <ReferralTierRewards currentReferrals={successfulReferrals} />

        {/* Email Digest Settings */}
        <EmailDigestSettings />
      </div>
    </DashboardLayout>
  );
}
