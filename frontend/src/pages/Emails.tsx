import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Eye,
  Calendar,
} from "lucide-react";
import { mockEmails, mockResumes, mockCompanies } from "@/data/mockData";
import { EmailStatus } from "@/types";
import { format } from "date-fns";

const statusConfig: Record<EmailStatus, { icon: React.ElementType; variant: "success" | "warning" | "error" | "secondary"; label: string }> = {
  scheduled: { icon: Clock, variant: "warning", label: "Scheduled" },
  sent: { icon: Send, variant: "success", label: "Sent" },
  delivered: { icon: CheckCircle2, variant: "success", label: "Delivered" },
  opened: { icon: Eye, variant: "success", label: "Opened" },
  failed: { icon: AlertCircle, variant: "error", label: "Failed" },
};

export default function Emails() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Email Scheduling</h1>
            <p className="text-muted-foreground mt-1">
              Schedule and track your resume submissions.
            </p>
          </div>
          <Button variant="hero">
            <Plus className="mr-2 h-4 w-4" />
            Schedule Email
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Scheduled", count: mockEmails.filter(e => e.status === 'scheduled').length, icon: Clock, color: "text-status-warning" },
            { label: "Sent", count: mockEmails.filter(e => e.status === 'sent').length, icon: Send, color: "text-tier-pro" },
            { label: "Delivered", count: mockEmails.filter(e => e.status === 'delivered').length, icon: CheckCircle2, color: "text-status-success" },
            { label: "Failed", count: mockEmails.filter(e => e.status === 'failed').length, icon: AlertCircle, color: "text-status-error" },
          ].map((stat) => (
            <Card key={stat.label} variant="default">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.count}</p>
                  </div>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Email List */}
        <Card variant="default">
          <CardHeader>
            <CardTitle>All Scheduled Emails</CardTitle>
            <CardDescription>View and manage your email submissions</CardDescription>
          </CardHeader>
          <CardContent>
            {mockEmails.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                  <Mail className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No scheduled emails</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Schedule your first email submission to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {mockEmails.map((email, index) => {
                  const resume = mockResumes.find(r => r.id === email.resumeId);
                  const company = mockCompanies.find(c => c.id === email.companyId);
                  const status = statusConfig[email.status];
                  const StatusIcon = status.icon;

                  return (
                    <div
                      key={email.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border hover:bg-secondary/30 transition-colors animate-slide-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-start sm:items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                          <Mail className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{company?.name || "Unknown Company"}</p>
                          <p className="text-sm text-muted-foreground">{resume?.title || "Unknown Resume"}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {format(email.scheduledFor, "MMM d, yyyy 'at' h:mm a")}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-4 sm:mt-0">
                        <Badge variant={status.variant}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                        {email.status === 'scheduled' && (
                          <Button variant="outline" size="sm">
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
