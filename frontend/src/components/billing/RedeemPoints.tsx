import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Coins, Gift, Check, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  tier: 'free' | 'pro' | 'premium' | 'all';
  available: boolean;
}

const availableRewards: Reward[] = [
  { 
    id: 'r1', 
    name: '5% Off Next Bill', 
    description: 'Get 5% off your next subscription payment',
    pointsCost: 250, 
    discountType: 'percentage', 
    discountValue: 5,
    tier: 'all',
    available: true 
  },
  { 
    id: 'r2', 
    name: '10% Off Next Bill', 
    description: 'Get 10% off your next subscription payment',
    pointsCost: 500, 
    discountType: 'percentage', 
    discountValue: 10,
    tier: 'all',
    available: true 
  },
  { 
    id: 'r3', 
    name: '$5 Credit', 
    description: '$5 applied to your next invoice',
    pointsCost: 400, 
    discountType: 'fixed', 
    discountValue: 5,
    tier: 'all',
    available: true 
  },
  { 
    id: 'r4', 
    name: '$10 Credit', 
    description: '$10 applied to your next invoice',
    pointsCost: 750, 
    discountType: 'fixed', 
    discountValue: 10,
    tier: 'pro',
    available: true 
  },
  { 
    id: 'r5', 
    name: '1 Month Pro Free', 
    description: 'Get one month of Pro subscription free',
    pointsCost: 1500, 
    discountType: 'fixed', 
    discountValue: 19,
    tier: 'free',
    available: true 
  },
  { 
    id: 'r6', 
    name: 'Priority Support', 
    description: 'Skip the queue with priority customer support',
    pointsCost: 300, 
    discountType: 'fixed', 
    discountValue: 0,
    tier: 'all',
    available: true 
  },
];

interface RedeemPointsProps {
  userPoints: number;
  onRedeem: (reward: Reward) => void;
  onPointsUpdated: (newBalance: number) => void;
}

export function RedeemPoints({ userPoints, onRedeem, onPointsUpdated }: RedeemPointsProps) {
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [redeemedRewards, setRedeemedRewards] = useState<string[]>([]);

  const userTier = user?.tier || 'free';

  const isEligible = (reward: Reward) => {
    if (reward.tier === 'all') return true;
    if (reward.tier === 'free' && userTier === 'free') return true;
    if (reward.tier === 'pro' && (userTier === 'pro' || userTier === 'premium')) return true;
    if (reward.tier === 'premium' && userTier === 'premium') return true;
    return false;
  };

  const handleSelectReward = (reward: Reward) => {
    if (userPoints < reward.pointsCost) {
      toast.error("Not enough points for this reward");
      return;
    }
    if (!isEligible(reward)) {
      toast.error(`This reward is for ${reward.tier} tier users`);
      return;
    }
    setSelectedReward(reward);
    setConfirmDialogOpen(true);
  };

  const handleConfirmRedeem = () => {
    if (!selectedReward) return;

    const newBalance = userPoints - selectedReward.pointsCost;
    onPointsUpdated(newBalance);
    setRedeemedRewards(prev => [...prev, selectedReward.id]);
    onRedeem(selectedReward);
    
    toast.success(
      <div className="flex items-center gap-2">
        <Gift className="h-4 w-4" />
        <span>Redeemed {selectedReward.name}!</span>
      </div>
    );
    
    setConfirmDialogOpen(false);
    setSelectedReward(null);
  };

  return (
    <>
      <Button variant="outline" onClick={() => setDialogOpen(true)} className="gap-2">
        <Coins className="h-4 w-4" />
        Redeem Points
        <Badge variant="secondary" className="ml-1">
          {userPoints.toLocaleString()}
        </Badge>
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Redeem Your Points
            </DialogTitle>
            <DialogDescription>
              Choose a reward to redeem with your loyalty points. Discounts will be applied to your next billing cycle.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Your Balance</p>
                  <p className="text-3xl font-bold">{userPoints.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">points</span></p>
                </div>
                <Coins className="h-10 w-10 text-primary/50" />
              </div>
            </div>

            <div className="grid gap-3">
              {availableRewards.map((reward) => {
                const canAfford = userPoints >= reward.pointsCost;
                const eligible = isEligible(reward);
                const alreadyRedeemed = redeemedRewards.includes(reward.id);
                
                return (
                  <Card 
                    key={reward.id} 
                    className={`relative overflow-hidden transition-all ${
                      canAfford && eligible && !alreadyRedeemed 
                        ? 'hover:border-primary cursor-pointer' 
                        : 'opacity-60'
                    }`}
                    onClick={() => canAfford && eligible && !alreadyRedeemed && handleSelectReward(reward)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{reward.name}</h4>
                            {reward.tier !== 'all' && (
                              <Badge variant="outline" className="text-xs">
                                {reward.tier.toUpperCase()} only
                              </Badge>
                            )}
                            {alreadyRedeemed && (
                              <Badge variant="default" className="text-xs gap-1">
                                <Check className="h-3 w-3" />
                                Redeemed
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{reward.description}</p>
                        </div>
                        <div className="text-right ml-4">
                          <div className="flex items-center gap-1 font-semibold">
                            <Coins className="h-4 w-4 text-amber-500" />
                            {reward.pointsCost}
                          </div>
                          {!canAfford && (
                            <p className="text-xs text-destructive">Need {reward.pointsCost - userPoints} more</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Confirm Redemption
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>You're about to redeem:</p>
                {selectedReward && (
                  <Card className="bg-muted">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{selectedReward.name}</h4>
                          <p className="text-sm text-muted-foreground">{selectedReward.description}</p>
                        </div>
                        <div className="flex items-center gap-1 font-semibold text-amber-600">
                          <Coins className="h-4 w-4" />
                          {selectedReward.pointsCost}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                <div className="flex items-center justify-center gap-4 py-2">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Current</p>
                    <p className="text-lg font-bold">{userPoints}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">After</p>
                    <p className="text-lg font-bold text-primary">
                      {selectedReward ? userPoints - selectedReward.pointsCost : userPoints}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  This action cannot be undone. The discount will be applied to your next billing cycle.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRedeem}>
              <Gift className="h-4 w-4 mr-2" />
              Confirm Redemption
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
