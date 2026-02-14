import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Coins,
  TrendingUp,
  Gift,
  Clock,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Crown,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { RedeemPoints } from "@/components/billing/RedeemPoints";

interface PointsTransaction {
  id: string;
  type: 'earned' | 'redeemed' | 'expired' | 'bonus';
  amount: number;
  description: string;
  date: Date;
  expiresAt?: Date;
}

interface PointsBatch {
  id: string;
  amount: number;
  earnedAt: Date;
  expiresAt: Date;
  source: string;
}

// Mock data for user's points
const mockPointsBatches: PointsBatch[] = [
  { id: 'b1', amount: 150, earnedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), source: 'Monthly subscription' },
  { id: 'b2', amount: 200, earnedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), source: 'Resume created' },
  { id: 'b3', amount: 500, earnedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), expiresAt: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000), source: 'Referral bonus' },
  { id: 'b4', amount: 100, earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), expiresAt: new Date(Date.now() + 83 * 24 * 60 * 60 * 1000), source: 'Cover letter created' },
  { id: 'b5', amount: 75, earnedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), source: 'Daily login' },
];

const mockTransactions: PointsTransaction[] = [
  { id: 't1', type: 'earned', amount: 75, description: 'Daily login bonus', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
  { id: 't2', type: 'redeemed', amount: -250, description: 'Redeemed: 5% Off Next Bill', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
  { id: 't3', type: 'earned', amount: 100, description: 'Cover letter created', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  { id: 't4', type: 'bonus', amount: 500, description: 'Referral: john@example.com signed up', date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
  { id: 't5', type: 'expired', amount: -100, description: 'Points expired', date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
  { id: 't6', type: 'earned', amount: 200, description: 'Resume created', date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  { id: 't7', type: 'earned', amount: 150, description: 'Monthly subscription reward', date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
];

// Points value in dollars
const POINTS_TO_DOLLAR_RATE = 0.01; // 100 points = $1

const tierMultipliers = {
  free: 1,
  pro: 1.5,
  premium: 2,
};

export default function MyLoyaltyPoints() {
  const { user } = useAuth();
  const [userPoints, setUserPoints] = useState(1025);
  const [transactions, setTransactions] = useState(mockTransactions);

  const userTier = user?.tier || 'free';
  const multiplier = tierMultipliers[userTier];
  const pointsValue = (userPoints * POINTS_TO_DOLLAR_RATE).toFixed(2);

  // Calculate expiring soon (within 14 days)
  const expiringBatches = mockPointsBatches.filter(b => {
    const daysUntilExpiry = Math.ceil((b.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry > 0 && daysUntilExpiry <= 14;
  });

  const totalExpiringSoon = expiringBatches.reduce((sum, b) => sum + b.amount, 0);

  // Next tier threshold
  const tierThresholds = { free: 500, pro: 1000, premium: Infinity };
  const nextTierName = userTier === 'free' ? 'Pro' : userTier === 'pro' ? 'Premium' : null;
  const nextThreshold = tierThresholds[userTier];
  const progressToNext = nextTierName ? Math.min((userPoints / nextThreshold) * 100, 100) : 100;

  const handleRedeem = (reward: { name: string; pointsCost: number }) => {
    const newTransaction: PointsTransaction = {
      id: `t${Date.now()}`,
      type: 'redeemed',
      amount: -reward.pointsCost,
      description: `Redeemed: ${reward.name}`,
      date: new Date(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const handlePointsUpdated = (newBalance: number) => {
    setUserPoints(newBalance);
  };

  const getTransactionIcon = (type: PointsTransaction['type']) => {
    switch (type) {
      case 'earned':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case 'redeemed':
        return <Gift className="h-4 w-4 text-primary" />;
      case 'expired':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'bonus':
        return <Sparkles className="h-4 w-4 text-amber-500" />;
    }
  };

  const formatDaysUntil = (date: Date) => {
    const days = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'Expired';
    if (days === 1) return '1 day';
    if (days < 7) return `${days} days`;
    if (days < 30) return `${Math.ceil(days / 7)} weeks`;
    return `${Math.ceil(days / 30)} months`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-2">
              <Coins className="h-8 w-8 text-amber-500" />
              My Loyalty Points
            </h1>
            <p className="text-muted-foreground mt-1">
              Earn points and redeem them for discounts on your subscription
            </p>
          </div>
          <RedeemPoints 
            userPoints={userPoints} 
            onRedeem={handleRedeem}
            onPointsUpdated={handlePointsUpdated}
          />
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Total Points */}
          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Coins className="h-4 w-4" />
                Total Points
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{userPoints.toLocaleString()}</span>
                <span className="text-muted-foreground">pts</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                  ≈ ${pointsValue} value
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Earning Rate */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Your Earning Rate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{multiplier}x</span>
                <span className="text-muted-foreground">multiplier</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant={userTier} className="gap-1">
                  <Crown className="h-3 w-3" />
                  {userTier.toUpperCase()} Tier
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Expiring Soon */}
          <Card className={totalExpiringSoon > 0 ? "border-orange-500/30 bg-orange-500/5" : ""}>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <AlertTriangle className={`h-4 w-4 ${totalExpiringSoon > 0 ? 'text-orange-500' : ''}`} />
                Expiring Soon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{totalExpiringSoon}</span>
                <span className="text-muted-foreground">pts</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {totalExpiringSoon > 0 ? 'Within the next 14 days' : 'No points expiring soon'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progress to Next Tier */}
        {nextTierName && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Progress to {nextTierName}
              </CardTitle>
              <CardDescription>
                Earn {nextThreshold - userPoints} more points to unlock {nextTierName} tier benefits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{userPoints} points</span>
                  <span>{nextThreshold} points</span>
                </div>
                <Progress value={progressToNext} className="h-3" />
              </div>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Upgrade benefits:</p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>• {userTier === 'free' ? '1.5x' : '2x'} points earning rate</li>
                  <li>• Exclusive redemption rewards</li>
                  <li>• Priority support access</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs for Transactions and Batches */}
        <Tabs defaultValue="transactions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="transactions">Transaction History</TabsTrigger>
            <TabsTrigger value="batches">Points Expiration</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>All your points activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between py-3 border-b last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.date.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className={`font-semibold ${transaction.amount >= 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {transaction.amount >= 0 ? '+' : ''}{transaction.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="batches">
            <Card>
              <CardHeader>
                <CardTitle>Points Expiration Schedule</CardTitle>
                <CardDescription>Track when your points batches expire</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPointsBatches
                    .filter(b => b.expiresAt > new Date())
                    .sort((a, b) => a.expiresAt.getTime() - b.expiresAt.getTime())
                    .map((batch) => {
                      const daysUntil = Math.ceil((batch.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                      const isExpiringSoon = daysUntil <= 14;

                      return (
                        <div
                          key={batch.id}
                          className={`flex items-center justify-between p-4 rounded-lg border ${
                            isExpiringSoon ? 'border-orange-500/30 bg-orange-500/5' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              isExpiringSoon ? 'bg-orange-500/10' : 'bg-muted'
                            }`}>
                              <Coins className={`h-5 w-5 ${isExpiringSoon ? 'text-orange-500' : 'text-amber-500'}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{batch.amount} points</p>
                                {isExpiringSoon && (
                                  <Badge variant="destructive" className="text-xs">
                                    Expires soon
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{batch.source}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className={isExpiringSoon ? 'text-orange-600 font-medium' : 'text-muted-foreground'}>
                                {formatDaysUntil(batch.expiresAt)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {batch.expiresAt.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* How to Earn Points */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Ways to Earn Points
            </CardTitle>
            <CardDescription>Complete activities to earn loyalty points</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                { action: 'Create a resume', points: 100, icon: '📄' },
                { action: 'Create a cover letter', points: 50, icon: '✉️' },
                { action: 'Refer a friend', points: 500, icon: '👥' },
                { action: 'Daily login', points: 25, icon: '🔥' },
                { action: 'Complete profile', points: 200, icon: '✅' },
                { action: 'Subscribe to Pro', points: 300, icon: '⭐' },
                { action: 'Leave feedback', points: 75, icon: '💬' },
                { action: 'Share on social', points: 100, icon: '📱' },
              ].map((item) => (
                <div
                  key={item.action}
                  className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <p className="font-medium">{item.action}</p>
                      <p className="text-sm text-amber-600 flex items-center gap-1">
                        <Coins className="h-3 w-3" />
                        +{item.points * multiplier} pts
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
