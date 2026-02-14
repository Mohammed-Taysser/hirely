import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Crown, TrendingUp, Coins } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar?: string;
  referralCount: number;
  pointsEarned: number;
  rank: number;
  tier: 'free' | 'pro' | 'premium';
  trend: 'up' | 'down' | 'same';
}

// Mock leaderboard data
const generateLeaderboardData = (period: string): LeaderboardEntry[] => {
  const baseData: Omit<LeaderboardEntry, 'rank'>[] = [
    { id: '1', name: 'Sarah Chen', referralCount: 47, pointsEarned: 23500, tier: 'premium', trend: 'up' },
    { id: '2', name: 'Mike Johnson', referralCount: 38, pointsEarned: 19000, tier: 'premium', trend: 'same' },
    { id: '3', name: 'Emily Davis', referralCount: 31, pointsEarned: 15500, tier: 'pro', trend: 'up' },
    { id: '4', name: 'Alex Thompson', referralCount: 28, pointsEarned: 14000, tier: 'premium', trend: 'down' },
    { id: '5', name: 'Jessica Lee', referralCount: 24, pointsEarned: 12000, tier: 'pro', trend: 'up' },
    { id: '6', name: 'David Wilson', referralCount: 21, pointsEarned: 10500, tier: 'pro', trend: 'same' },
    { id: '7', name: 'Rachel Brown', referralCount: 18, pointsEarned: 9000, tier: 'free', trend: 'up' },
    { id: '8', name: 'Chris Martinez', referralCount: 15, pointsEarned: 7500, tier: 'pro', trend: 'down' },
    { id: '9', name: 'Amanda Taylor', referralCount: 12, pointsEarned: 6000, tier: 'free', trend: 'same' },
    { id: '10', name: 'Kevin Anderson', referralCount: 9, pointsEarned: 4500, tier: 'free', trend: 'up' },
  ];

  // Adjust numbers based on period
  const multiplier = period === 'weekly' ? 0.15 : period === 'monthly' ? 0.4 : 1;
  
  return baseData
    .map((entry, index) => ({
      ...entry,
      referralCount: Math.max(1, Math.floor(entry.referralCount * multiplier)),
      pointsEarned: Math.max(100, Math.floor(entry.pointsEarned * multiplier)),
      rank: index + 1,
    }))
    .sort((a, b) => b.referralCount - a.referralCount);
};

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="h-5 w-5 text-amber-500" />;
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />;
    case 3:
      return <Medal className="h-5 w-5 text-amber-700" />;
    default:
      return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
  }
};

const getTierBadge = (tier: 'free' | 'pro' | 'premium') => {
  switch (tier) {
    case 'premium':
      return <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs">Premium</Badge>;
    case 'pro':
      return <Badge className="bg-primary text-primary-foreground text-xs">Pro</Badge>;
    default:
      return <Badge variant="secondary" className="text-xs">Free</Badge>;
  }
};

const getTrendIcon = (trend: 'up' | 'down' | 'same') => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case 'down':
      return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
    default:
      return null;
  }
};

export function ReferralLeaderboard() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'all-time'>('all-time');
  
  const leaderboardData = generateLeaderboardData(period);
  
  // Find current user's position (mock: place them at position 15)
  const userRank = 15;
  const userStats = {
    referralCount: 4,
    pointsEarned: 2000,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Top Referrers Leaderboard
            </CardTitle>
            <CardDescription>
              See how you rank among the top referrers
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="weekly">This Week</TabsTrigger>
            <TabsTrigger value="monthly">This Month</TabsTrigger>
            <TabsTrigger value="all-time">All Time</TabsTrigger>
          </TabsList>

          <TabsContent value={period} className="space-y-4">
            {/* Top 3 Podium */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {/* 2nd Place */}
              <div className="flex flex-col items-center pt-8">
                <div className="relative">
                  <Avatar className="h-16 w-16 border-4 border-gray-300">
                    <AvatarFallback className="bg-gray-100 text-lg font-bold">
                      {leaderboardData[1]?.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="font-bold text-white">2</span>
                  </div>
                </div>
                <p className="mt-2 font-semibold text-sm text-center truncate w-full">
                  {leaderboardData[1]?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {leaderboardData[1]?.referralCount} referrals
                </p>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                    <Crown className="h-8 w-8 text-amber-500" />
                  </div>
                  <Avatar className="h-20 w-20 border-4 border-amber-500 ring-4 ring-amber-200">
                    <AvatarFallback className="bg-amber-100 text-xl font-bold text-amber-700">
                      {leaderboardData[0]?.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center">
                    <span className="font-bold text-white">1</span>
                  </div>
                </div>
                <p className="mt-4 font-semibold text-center">
                  {leaderboardData[0]?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {leaderboardData[0]?.referralCount} referrals
                </p>
                <div className="flex items-center gap-1 text-amber-600 font-semibold mt-1">
                  <Coins className="h-4 w-4" />
                  {leaderboardData[0]?.pointsEarned.toLocaleString()}
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center pt-12">
                <div className="relative">
                  <Avatar className="h-14 w-14 border-4 border-amber-700">
                    <AvatarFallback className="bg-amber-100 text-lg font-bold text-amber-800">
                      {leaderboardData[2]?.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-amber-700 flex items-center justify-center">
                    <span className="font-bold text-white text-sm">3</span>
                  </div>
                </div>
                <p className="mt-2 font-semibold text-sm text-center truncate w-full">
                  {leaderboardData[2]?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {leaderboardData[2]?.referralCount} referrals
                </p>
              </div>
            </div>

            {/* Full Rankings List */}
            <div className="space-y-2">
              {leaderboardData.slice(3).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 flex justify-center">
                      {getRankIcon(entry.rank)}
                    </div>
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-sm font-medium">
                        {entry.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{entry.name}</span>
                        {getTierBadge(entry.tier)}
                        {getTrendIcon(entry.trend)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {entry.referralCount} referrals
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-600 font-semibold">
                    <Coins className="h-4 w-4" />
                    {entry.pointsEarned.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Current User's Rank */}
            <div className="mt-6 p-4 rounded-lg border-2 border-primary bg-primary/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-8 flex justify-center">
                    <span className="text-sm font-bold text-primary">#{userRank}</span>
                  </div>
                  <Avatar className="h-10 w-10 border-2 border-primary">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {user?.name?.split(' ').map(n => n[0]).join('') || 'ME'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{user?.name || 'You'}</span>
                      <Badge variant="outline" className="text-xs">You</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {userStats.referralCount} referrals
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-600 font-semibold">
                  <Coins className="h-4 w-4" />
                  {userStats.pointsEarned.toLocaleString()}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
