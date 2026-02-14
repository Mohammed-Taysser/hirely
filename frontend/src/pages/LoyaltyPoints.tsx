import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Coins, 
  Gift, 
  TrendingUp, 
  Users, 
  Plus, 
  Search,
  ArrowUpRight,
  ArrowDownRight,
  History,
  Award,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface UserBalance {
  id: string;
  name: string;
  email: string;
  tier: 'free' | 'pro' | 'premium';
  points: number;
  lifetimePoints: number;
  lastActivity: Date;
}

interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: 'earned' | 'redeemed' | 'bonus' | 'expired';
  points: number;
  description: string;
  createdAt: Date;
}

interface Redemption {
  id: string;
  userId: string;
  userName: string;
  reward: string;
  pointsCost: number;
  status: 'pending' | 'completed' | 'cancelled';
  redeemedAt: Date;
  completedAt?: Date;
}

// Mock data
const mockUsers: UserBalance[] = [
  { id: '1', name: 'Alex Johnson', email: 'alex@example.com', tier: 'premium', points: 2500, lifetimePoints: 5000, lastActivity: new Date('2024-01-20') },
  { id: '2', name: 'Sarah Chen', email: 'sarah@example.com', tier: 'pro', points: 1200, lifetimePoints: 2400, lastActivity: new Date('2024-01-19') },
  { id: '3', name: 'Mike Williams', email: 'mike@example.com', tier: 'free', points: 450, lifetimePoints: 800, lastActivity: new Date('2024-01-18') },
  { id: '4', name: 'Emily Davis', email: 'emily@example.com', tier: 'pro', points: 890, lifetimePoints: 1500, lastActivity: new Date('2024-01-17') },
  { id: '5', name: 'James Brown', email: 'james@example.com', tier: 'premium', points: 3200, lifetimePoints: 6500, lastActivity: new Date('2024-01-20') },
];

const mockTransactions: Transaction[] = [
  { id: 't1', userId: '1', userName: 'Alex Johnson', type: 'earned', points: 100, description: 'Resume creation bonus', createdAt: new Date('2024-01-20T10:00:00') },
  { id: 't2', userId: '2', userName: 'Sarah Chen', type: 'redeemed', points: -500, description: 'Redeemed for Pro upgrade discount', createdAt: new Date('2024-01-19T15:30:00') },
  { id: 't3', userId: '1', userName: 'Alex Johnson', type: 'bonus', points: 200, description: 'Admin bonus: Loyalty reward', createdAt: new Date('2024-01-18T09:00:00') },
  { id: 't4', userId: '3', userName: 'Mike Williams', type: 'earned', points: 50, description: 'Profile completion', createdAt: new Date('2024-01-17T14:00:00') },
  { id: 't5', userId: '5', userName: 'James Brown', type: 'redeemed', points: -1000, description: 'Redeemed for Premium upgrade', createdAt: new Date('2024-01-16T11:00:00') },
];

const mockRedemptions: Redemption[] = [
  { id: 'r1', userId: '2', userName: 'Sarah Chen', reward: '10% Discount on Pro Plan', pointsCost: 500, status: 'completed', redeemedAt: new Date('2024-01-19'), completedAt: new Date('2024-01-19') },
  { id: 'r2', userId: '5', userName: 'James Brown', reward: '1 Month Premium Free', pointsCost: 1000, status: 'completed', redeemedAt: new Date('2024-01-16'), completedAt: new Date('2024-01-16') },
  { id: 'r3', userId: '1', userName: 'Alex Johnson', reward: 'Priority Support', pointsCost: 300, status: 'pending', redeemedAt: new Date('2024-01-20') },
  { id: 'r4', userId: '4', userName: 'Emily Davis', reward: '5% Discount', pointsCost: 250, status: 'cancelled', redeemedAt: new Date('2024-01-15') },
];

const tierColors = {
  free: 'bg-secondary text-secondary-foreground',
  pro: 'bg-primary/20 text-primary',
  premium: 'bg-amber-500/20 text-amber-600',
};

export default function LoyaltyPoints() {
  const [users, setUsers] = useState<UserBalance[]>(mockUsers);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [redemptions] = useState<Redemption[]>(mockRedemptions);
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [awardDialogOpen, setAwardDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserBalance | null>(null);
  const [bonusPoints, setBonusPoints] = useState("");
  const [bonusReason, setBonusReason] = useState("");

  const totalPoints = users.reduce((sum, u) => sum + u.points, 0);
  const totalRedemptions = redemptions.filter(r => r.status === 'completed').length;
  const pendingRedemptions = redemptions.filter(r => r.status === 'pending').length;

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = tierFilter === "all" || user.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const handleAwardPoints = () => {
    if (!selectedUser || !bonusPoints || parseInt(bonusPoints) <= 0) {
      toast.error("Please enter valid points amount");
      return;
    }

    const points = parseInt(bonusPoints);
    
    // Update user balance
    setUsers(prev => prev.map(u => 
      u.id === selectedUser.id 
        ? { ...u, points: u.points + points, lifetimePoints: u.lifetimePoints + points }
        : u
    ));

    // Add transaction
    const newTransaction: Transaction = {
      id: `t${Date.now()}`,
      userId: selectedUser.id,
      userName: selectedUser.name,
      type: 'bonus',
      points: points,
      description: `Admin bonus: ${bonusReason || 'Manual award'}`,
      createdAt: new Date(),
    };
    setTransactions(prev => [newTransaction, ...prev]);

    toast.success(`Awarded ${points} points to ${selectedUser.name}`);
    setAwardDialogOpen(false);
    setSelectedUser(null);
    setBonusPoints("");
    setBonusReason("");
  };

  const openAwardDialog = (user: UserBalance) => {
    setSelectedUser(user);
    setAwardDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold">Loyalty Points Management</h1>
          <p className="text-muted-foreground mt-1">
            View balances, award bonus points, and track redemption history.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Points in Circulation</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPoints.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across {users.length} users</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed Redemptions</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRedemptions}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Redemptions</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingRedemptions}</div>
              <p className="text-xs text-muted-foreground">Awaiting processing</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Points/User</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(totalPoints / users.length)}</div>
              <p className="text-xs text-muted-foreground">Current balance</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="balances" className="space-y-4">
          <TabsList>
            <TabsTrigger value="balances" className="gap-2">
              <Users className="h-4 w-4" />
              User Balances
            </TabsTrigger>
            <TabsTrigger value="transactions" className="gap-2">
              <History className="h-4 w-4" />
              Transaction History
            </TabsTrigger>
            <TabsTrigger value="redemptions" className="gap-2">
              <Gift className="h-4 w-4" />
              Redemptions
            </TabsTrigger>
          </TabsList>

          {/* User Balances Tab */}
          <TabsContent value="balances" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>All User Balances</CardTitle>
                    <CardDescription>View and manage loyalty points for all users</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-[200px]"
                      />
                    </div>
                    <Select value={tierFilter} onValueChange={setTierFilter}>
                      <SelectTrigger className="w-[130px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter tier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tiers</SelectItem>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead className="text-right">Current Points</TableHead>
                      <TableHead className="text-right">Lifetime Points</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={tierColors[user.tier]}>
                            {user.tier.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {user.points.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {user.lifetimePoints.toLocaleString()}
                        </TableCell>
                        <TableCell>{format(user.lastActivity, 'MMM d, yyyy')}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openAwardDialog(user)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Award
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transaction History Tab */}
          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>All points earned, redeemed, and awarded</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>{format(tx.createdAt, 'MMM d, yyyy HH:mm')}</TableCell>
                        <TableCell className="font-medium">{tx.userName}</TableCell>
                        <TableCell>
                          <Badge variant={tx.type === 'redeemed' ? 'destructive' : tx.type === 'bonus' ? 'default' : 'secondary'}>
                            {tx.type === 'earned' && <TrendingUp className="h-3 w-3 mr-1" />}
                            {tx.type === 'redeemed' && <ArrowDownRight className="h-3 w-3 mr-1" />}
                            {tx.type === 'bonus' && <Award className="h-3 w-3 mr-1" />}
                            {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{tx.description}</TableCell>
                        <TableCell className={`text-right font-medium ${tx.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.points > 0 ? '+' : ''}{tx.points}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Redemptions Tab */}
          <TabsContent value="redemptions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Redemption History</CardTitle>
                <CardDescription>All point redemptions and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Reward</TableHead>
                      <TableHead className="text-right">Points Cost</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {redemptions.map((redemption) => (
                      <TableRow key={redemption.id}>
                        <TableCell>{format(redemption.redeemedAt, 'MMM d, yyyy')}</TableCell>
                        <TableCell className="font-medium">{redemption.userName}</TableCell>
                        <TableCell>{redemption.reward}</TableCell>
                        <TableCell className="text-right">{redemption.pointsCost}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              redemption.status === 'completed' ? 'default' : 
                              redemption.status === 'pending' ? 'secondary' : 'destructive'
                            }
                          >
                            {redemption.status.charAt(0).toUpperCase() + redemption.status.slice(1)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Award Points Dialog */}
        <Dialog open={awardDialogOpen} onOpenChange={setAwardDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Award Bonus Points</DialogTitle>
              <DialogDescription>
                Award bonus points to {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="points">Points to Award</Label>
                <Input
                  id="points"
                  type="number"
                  placeholder="100"
                  value={bonusPoints}
                  onChange={(e) => setBonusPoints(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason (optional)</Label>
                <Textarea
                  id="reason"
                  placeholder="e.g., Loyalty reward, referral bonus..."
                  value={bonusReason}
                  onChange={(e) => setBonusReason(e.target.value)}
                />
              </div>
              {selectedUser && (
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                  <p className="text-2xl font-bold">{selectedUser.points.toLocaleString()} pts</p>
                  {bonusPoints && parseInt(bonusPoints) > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      <ArrowUpRight className="h-3 w-3 inline mr-1" />
                      New balance: {(selectedUser.points + parseInt(bonusPoints)).toLocaleString()} pts
                    </p>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAwardDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAwardPoints}>
                <Plus className="h-4 w-4 mr-2" />
                Award Points
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
