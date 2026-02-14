import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Star,
  Crown,
  Zap,
  Palette,
  Headphones,
  TrendingUp,
  Gift,
  Check,
  Lock,
  Sparkles,
  Shield,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ReferralTier {
  id: string;
  name: string;
  icon: React.ReactNode;
  minReferrals: number;
  color: string;
  bgColor: string;
  borderColor: string;
  perks: {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
  }[];
}

const referralTiers: ReferralTier[] = [
  {
    id: 'bronze',
    name: 'Bronze Referrer',
    icon: <Star className="h-6 w-6" />,
    minReferrals: 0,
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-300',
    perks: [
      {
        id: 'basic-link',
        name: 'Referral Link',
        description: 'Share your unique referral link',
        icon: <ExternalLink className="h-4 w-4" />,
      },
      {
        id: 'basic-tracking',
        name: 'Basic Tracking',
        description: 'Track your referral signups',
        icon: <TrendingUp className="h-4 w-4" />,
      },
    ],
  },
  {
    id: 'silver',
    name: 'Silver Referrer',
    icon: <Zap className="h-6 w-6" />,
    minReferrals: 5,
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-400',
    perks: [
      {
        id: 'custom-page',
        name: 'Custom Referral Page',
        description: 'Personalize your referral landing page',
        icon: <Palette className="h-4 w-4" />,
      },
      {
        id: 'bonus-multiplier',
        name: '1.25x Point Multiplier',
        description: 'Earn 25% more points per referral',
        icon: <Sparkles className="h-4 w-4" />,
      },
    ],
  },
  {
    id: 'gold',
    name: 'Gold Referrer',
    icon: <Crown className="h-6 w-6" />,
    minReferrals: 15,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-500',
    perks: [
      {
        id: 'priority-support',
        name: 'Priority Support',
        description: '24-hour response time guaranteed',
        icon: <Headphones className="h-4 w-4" />,
      },
      {
        id: 'early-access',
        name: 'Early Feature Access',
        description: 'Try new features before anyone else',
        icon: <Zap className="h-4 w-4" />,
      },
      {
        id: 'gold-multiplier',
        name: '1.5x Point Multiplier',
        description: 'Earn 50% more points per referral',
        icon: <Sparkles className="h-4 w-4" />,
      },
    ],
  },
  {
    id: 'platinum',
    name: 'Platinum Referrer',
    icon: <Shield className="h-6 w-6" />,
    minReferrals: 30,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-500',
    perks: [
      {
        id: 'dedicated-manager',
        name: 'Dedicated Account Manager',
        description: 'Personal support contact for your needs',
        icon: <Headphones className="h-4 w-4" />,
      },
      {
        id: 'exclusive-events',
        name: 'Exclusive Events',
        description: 'Invitations to VIP webinars and meetups',
        icon: <Gift className="h-4 w-4" />,
      },
      {
        id: 'platinum-multiplier',
        name: '2x Point Multiplier',
        description: 'Earn double points per referral',
        icon: <Sparkles className="h-4 w-4" />,
      },
      {
        id: 'custom-branding',
        name: 'Custom Branding',
        description: 'Add your logo to referral materials',
        icon: <Palette className="h-4 w-4" />,
      },
    ],
  },
];

interface ReferralTierRewardsProps {
  currentReferrals: number;
}

export function ReferralTierRewards({ currentReferrals }: ReferralTierRewardsProps) {
  // Determine current tier
  const currentTier = [...referralTiers]
    .reverse()
    .find(tier => currentReferrals >= tier.minReferrals) || referralTiers[0];
  
  const nextTier = referralTiers.find(tier => tier.minReferrals > currentReferrals);
  
  const progressToNext = nextTier
    ? ((currentReferrals - currentTier.minReferrals) / (nextTier.minReferrals - currentTier.minReferrals)) * 100
    : 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          Referral Tier Rewards
        </CardTitle>
        <CardDescription>
          Unlock exclusive perks as you grow your referral network
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className={cn(
          "p-4 rounded-lg border-2",
          currentTier.bgColor,
          currentTier.borderColor
        )}>
          <div className="flex items-center gap-4">
            <div className={cn(
              "h-14 w-14 rounded-full flex items-center justify-center",
              currentTier.bgColor,
              currentTier.color
            )}>
              {currentTier.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className={cn("text-lg font-bold", currentTier.color)}>
                  {currentTier.name}
                </h3>
                <Badge className="bg-primary text-primary-foreground">Current</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {currentReferrals} successful referrals
              </p>
            </div>
          </div>

          {nextTier && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>{currentReferrals} referrals</span>
                <span className="text-muted-foreground">
                  {nextTier.minReferrals} for {nextTier.name}
                </span>
              </div>
              <Progress value={progressToNext} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                {nextTier.minReferrals - currentReferrals} more referrals to unlock {nextTier.name}
              </p>
            </div>
          )}
        </div>

        {/* All Tiers */}
        <div className="space-y-4">
          {referralTiers.map((tier) => {
            const isUnlocked = currentReferrals >= tier.minReferrals;
            const isCurrent = tier.id === currentTier.id;

            return (
              <div
                key={tier.id}
                className={cn(
                  "p-4 rounded-lg border transition-all",
                  isUnlocked ? tier.bgColor : "bg-muted/30",
                  isUnlocked ? tier.borderColor : "border-muted",
                  isCurrent && "ring-2 ring-primary ring-offset-2"
                )}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center",
                    isUnlocked ? tier.bgColor : "bg-muted",
                    isUnlocked ? tier.color : "text-muted-foreground"
                  )}>
                    {isUnlocked ? tier.icon : <Lock className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className={cn(
                        "font-semibold",
                        isUnlocked ? tier.color : "text-muted-foreground"
                      )}>
                        {tier.name}
                      </h4>
                      {isCurrent && (
                        <Badge variant="outline" className="text-xs">You're here</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {tier.minReferrals}+ referrals required
                    </p>
                  </div>
                  {isUnlocked && !isCurrent && (
                    <Check className="h-5 w-5 text-green-500" />
                  )}
                </div>

                <div className="grid gap-2 ml-13">
                  {tier.perks.map((perk) => (
                    <div
                      key={perk.id}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-md text-sm",
                        isUnlocked ? "bg-background/50" : "bg-muted/50 opacity-60"
                      )}
                    >
                      <div className={cn(
                        "h-6 w-6 rounded flex items-center justify-center",
                        isUnlocked ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        {perk.icon}
                      </div>
                      <div>
                        <p className={cn(
                          "font-medium text-xs",
                          !isUnlocked && "text-muted-foreground"
                        )}>
                          {perk.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {perk.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <Button variant="hero" className="w-full sm:w-auto">
            <Gift className="h-4 w-4 mr-2" />
            Invite More Friends
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            Share your referral link to unlock more rewards
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
