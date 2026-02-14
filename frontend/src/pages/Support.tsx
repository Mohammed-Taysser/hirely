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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  HelpCircle, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare,
  GraduationCap,
  Shield,
  Zap,
  Search,
  Filter,
  ChevronRight,
  Timer,
  HeadphonesIcon,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";

interface Ticket {
  id: string;
  subject: string;
  description: string;
  category: 'billing' | 'technical' | 'account' | 'feature' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  lastResponse?: Date;
}

// SLA Information by tier
const slaInfo = {
  free: {
    responseTime: '48 hours',
    responseHours: 48,
    supportChannels: ['Email', 'Community Forum'],
    prioritySupport: false,
    dedicatedManager: false,
    trainingHours: 0,
  },
  pro: {
    responseTime: '24 hours',
    responseHours: 24,
    supportChannels: ['Email', 'Chat', 'Community Forum'],
    prioritySupport: false,
    dedicatedManager: false,
    trainingHours: 2,
  },
  premium: {
    responseTime: '4 hours',
    responseHours: 4,
    supportChannels: ['Email', 'Chat', 'Phone', 'Community Forum'],
    prioritySupport: true,
    dedicatedManager: true,
    trainingHours: 10,
  },
};

// Mock tickets
const mockTickets: Ticket[] = [
  {
    id: 'TKT-001',
    subject: 'Unable to export resume as PDF',
    description: 'When I try to export my resume, the PDF download fails.',
    category: 'technical',
    priority: 'high',
    status: 'in_progress',
    createdAt: new Date('2024-01-18T10:00:00'),
    updatedAt: new Date('2024-01-19T14:30:00'),
    lastResponse: new Date('2024-01-19T14:30:00'),
  },
  {
    id: 'TKT-002',
    subject: 'Question about Pro plan features',
    description: 'Can you clarify what features are included in the Pro plan?',
    category: 'billing',
    priority: 'low',
    status: 'resolved',
    createdAt: new Date('2024-01-15T09:00:00'),
    updatedAt: new Date('2024-01-16T11:00:00'),
    lastResponse: new Date('2024-01-16T11:00:00'),
  },
  {
    id: 'TKT-003',
    subject: 'Request for bulk import feature',
    description: 'It would be great to have a bulk import feature for multiple resumes.',
    category: 'feature',
    priority: 'medium',
    status: 'waiting',
    createdAt: new Date('2024-01-10T16:00:00'),
    updatedAt: new Date('2024-01-12T10:00:00'),
  },
];

const statusColors = {
  open: 'bg-blue-500/20 text-blue-600',
  in_progress: 'bg-amber-500/20 text-amber-600',
  waiting: 'bg-purple-500/20 text-purple-600',
  resolved: 'bg-green-500/20 text-green-600',
  closed: 'bg-secondary text-secondary-foreground',
};

const priorityColors = {
  low: 'bg-secondary text-secondary-foreground',
  medium: 'bg-blue-500/20 text-blue-600',
  high: 'bg-amber-500/20 text-amber-600',
  urgent: 'bg-red-500/20 text-red-600',
};

const categoryIcons = {
  billing: '💳',
  technical: '🔧',
  account: '👤',
  feature: '✨',
  other: '📝',
};

export default function Support() {
  const { user } = useAuth();
  const userTier = user?.tier || 'free';
  const sla = slaInfo[userTier];

  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    category: 'other' as Ticket['category'],
    priority: 'medium' as Ticket['priority'],
  });

  // Training hours used (mock data)
  const trainingHoursUsed = userTier === 'premium' ? 4 : userTier === 'pro' ? 1 : 0;

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

  const handleCreateTicket = () => {
    if (!newTicket.subject || !newTicket.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    const ticket: Ticket = {
      id: `TKT-${String(tickets.length + 1).padStart(3, '0')}`,
      ...newTicket,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setTickets(prev => [ticket, ...prev]);
    toast.success("Support ticket created successfully");
    setNewTicketOpen(false);
    setNewTicket({
      subject: '',
      description: '',
      category: 'other',
      priority: 'medium',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Support Center</h1>
            <p className="text-muted-foreground mt-1">
              Get help, manage tickets, and access your training resources.
            </p>
          </div>
          <Dialog open={newTicketOpen} onOpenChange={setNewTicketOpen}>
            <DialogTrigger asChild>
              <Button variant="hero">
                <Plus className="h-4 w-4 mr-2" />
                New Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Support Ticket</DialogTitle>
                <DialogDescription>
                  Describe your issue and we'll get back to you within {sla.responseTime}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your issue"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={newTicket.category} 
                      onValueChange={(v) => setNewTicket(prev => ({ ...prev, category: v as Ticket['category'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="billing">💳 Billing</SelectItem>
                        <SelectItem value="technical">🔧 Technical</SelectItem>
                        <SelectItem value="account">👤 Account</SelectItem>
                        <SelectItem value="feature">✨ Feature Request</SelectItem>
                        <SelectItem value="other">📝 Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={newTicket.priority} 
                      onValueChange={(v) => setNewTicket(prev => ({ ...prev, priority: v as Ticket['priority'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Please provide details about your issue..."
                    className="min-h-[120px]"
                    value={newTicket.description}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewTicketOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTicket}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Create Ticket
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats and SLA Info */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{openTickets}</div>
              <p className="text-xs text-muted-foreground">Awaiting resolution</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resolvedTickets}</div>
              <p className="text-xs text-muted-foreground">Successfully closed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Timer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sla.responseTime}</div>
              <p className="text-xs text-muted-foreground">SLA for {userTier} plan</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Training Hours</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{trainingHoursUsed}/{sla.trainingHours}h</div>
              <Progress value={(trainingHoursUsed / Math.max(sla.trainingHours, 1)) * 100} className="mt-2 h-2" />
            </CardContent>
          </Card>
        </div>

        {/* SLA & Benefits Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Your Support Benefits
              <Badge className="ml-2">{userTier.toUpperCase()}</Badge>
            </CardTitle>
            <CardDescription>
              Support features included in your subscription plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">Response Time</h4>
                  <p className="text-sm text-muted-foreground">{sla.responseTime} guaranteed</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
                <HeadphonesIcon className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">Support Channels</h4>
                  <p className="text-sm text-muted-foreground">{sla.supportChannels.join(', ')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted">
                <GraduationCap className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">Training Hours</h4>
                  <p className="text-sm text-muted-foreground">
                    {sla.trainingHours > 0 ? `${sla.trainingHours} hours/month included` : 'Not included'}
                  </p>
                </div>
              </div>
            </div>
            {sla.prioritySupport && (
              <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <span className="font-medium">Priority Support Active</span>
                  <Badge variant="default" className="ml-auto">Premium Benefit</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Your tickets are prioritized and you have access to a dedicated account manager.
                </p>
              </div>
            )}
            {userTier === 'free' && (
              <div className="mt-4 p-4 rounded-lg bg-muted border-dashed border-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Upgrade for faster support</h4>
                    <p className="text-sm text-muted-foreground">
                      Pro users get 24h response time, Premium gets 4h with priority support.
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Upgrade <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tickets Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Your Tickets</CardTitle>
                <CardDescription>View and manage your support requests</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-[200px]"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="waiting">Waiting</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTickets.length === 0 ? (
              <div className="text-center py-12">
                <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-1">No tickets found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {tickets.length === 0 
                    ? "You haven't created any support tickets yet." 
                    : "No tickets match your search criteria."}
                </p>
                <Button onClick={() => setNewTicketOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Ticket
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Update</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <p className="font-medium">{ticket.subject}</p>
                          <p className="text-xs text-muted-foreground">{ticket.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          {categoryIcons[ticket.category]}
                          <span className="capitalize">{ticket.category}</span>
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={priorityColors[ticket.priority]}>
                          {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[ticket.status]}>
                          {ticket.status.replace('_', ' ').charAt(0).toUpperCase() + ticket.status.replace('_', ' ').slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(ticket.createdAt, 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(ticket.updatedAt, 'MMM d, HH:mm')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
