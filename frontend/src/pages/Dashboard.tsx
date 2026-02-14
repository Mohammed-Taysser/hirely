import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  FileText,
  Building2,
  Mail,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import { mockResumes, mockCompanies, mockEmails, mockActivities } from "@/data/mockData";
import { formatDistanceToNow } from "date-fns";
import { AnalyticsCharts } from "@/components/dashboard/AnalyticsCharts";
import { useAuth } from "@/contexts/AuthContext";

const stats = [
  {
    title: "Total Resumes",
    value: mockResumes.length,
    icon: FileText,
    color: "text-tier-pro",
    bgColor: "bg-tier-pro/10",
  },
  {
    title: "Companies",
    value: mockCompanies.length,
    icon: Building2,
    color: "text-tier-premium",
    bgColor: "bg-tier-premium/10",
  },
  {
    title: "Emails Sent",
    value: mockEmails.filter(e => e.status === 'sent' || e.status === 'delivered').length,
    icon: Mail,
    color: "text-status-success",
    bgColor: "bg-status-success/10",
  },
  {
    title: "Scheduled",
    value: mockEmails.filter(e => e.status === 'scheduled').length,
    icon: Clock,
    color: "text-status-warning",
    bgColor: "bg-status-warning/10",
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'delivered':
    case 'sent':
      return <CheckCircle2 className="h-4 w-4 text-status-success" />;
    case 'scheduled':
      return <Clock className="h-4 w-4 text-status-warning" />;
    case 'failed':
      return <AlertCircle className="h-4 w-4 text-status-error" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

export default function Dashboard() {
  const { user } = useAuth();
  const displayName = user?.name?.split(' ')[0] || 'User';

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Welcome back, {displayName}
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your job search.
            </p>
          </div>
          <Button variant="hero" asChild>
            <Link to="/resumes/new">
              <Plus className="mr-2 h-4 w-4" />
              New Resume
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title} variant="default">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Analytics Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Analytics Overview</h2>
          </div>
          <AnalyticsCharts />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Resumes */}
          <Card variant="default" className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Resumes</CardTitle>
                <CardDescription>Your latest resume drafts</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/resumes">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockResumes.slice(0, 3).map((resume) => (
                  <div
                    key={resume.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{resume.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Updated {formatDistanceToNow(resume.updatedAt)} ago
                        </p>
                      </div>
                    </div>
                    <Badge variant={resume.tier}>{resume.tier}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card variant="default">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockActivities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(activity.createdAt)} ago
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scheduled Emails */}
        <Card variant="default">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Scheduled Emails</CardTitle>
              <CardDescription>Upcoming resume submissions</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/emails">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {mockEmails.slice(0, 3).map((email) => {
                const resume = mockResumes.find(r => r.id === email.resumeId);
                const company = mockCompanies.find(c => c.id === email.companyId);
                return (
                  <div
                    key={email.id}
                    className="p-4 rounded-xl border border-border"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(email.status)}
                      <Badge 
                        variant={
                          email.status === 'delivered' || email.status === 'sent' ? 'success' :
                          email.status === 'scheduled' ? 'warning' : 'error'
                        }
                      >
                        {email.status}
                      </Badge>
                    </div>
                    <p className="font-medium">{company?.name}</p>
                    <p className="text-sm text-muted-foreground">{resume?.title}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {email.scheduledFor.toLocaleDateString()} at {email.scheduledFor.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}