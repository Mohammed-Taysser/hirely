import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from "recharts";
import { Eye, Download, Send, CheckCircle, XCircle, Clock, TrendingUp, FileText, ArrowUpRight, ArrowDownRight } from "lucide-react";

const viewsData = [
  { date: "Jan", views: 45, downloads: 12, applications: 8 },
  { date: "Feb", views: 62, downloads: 18, applications: 14 },
  { date: "Mar", views: 78, downloads: 24, applications: 19 },
  { date: "Apr", views: 95, downloads: 31, applications: 22 },
  { date: "May", views: 110, downloads: 38, applications: 28 },
  { date: "Jun", views: 132, downloads: 45, applications: 35 },
  { date: "Jul", views: 148, downloads: 52, applications: 41 },
];

const outcomeData = [
  { name: "Interview Invited", value: 18, color: "hsl(var(--primary))" },
  { name: "Offer Received", value: 5, color: "hsl(142 76% 36%)" },
  { name: "Rejected", value: 12, color: "hsl(0 84% 60%)" },
  { name: "Pending", value: 8, color: "hsl(48 96% 53%)" },
  { name: "No Response", value: 15, color: "hsl(var(--muted-foreground))" },
];

const resumePerformance = [
  { name: "Software Engineer Resume", views: 89, downloads: 32, score: 92 },
  { name: "Frontend Developer Resume", views: 64, downloads: 21, score: 85 },
  { name: "Full Stack Resume", views: 45, downloads: 15, score: 78 },
  { name: "Tech Lead Resume", views: 38, downloads: 12, score: 88 },
];

const weeklyActivity = [
  { day: "Mon", actions: 12 },
  { day: "Tue", actions: 8 },
  { day: "Wed", actions: 15 },
  { day: "Thu", actions: 22 },
  { day: "Fri", actions: 18 },
  { day: "Sat", actions: 5 },
  { day: "Sun", actions: 3 },
];

const stats = [
  { label: "Total Views", value: "670", change: "+12.5%", up: true, icon: Eye },
  { label: "Downloads", value: "220", change: "+8.3%", up: true, icon: Download },
  { label: "Applications Sent", value: "167", change: "+15.2%", up: true, icon: Send },
  { label: "Interview Rate", value: "31%", change: "-2.1%", up: false, icon: CheckCircle },
];

export default function ResumeAnalytics() {
  const [timeRange, setTimeRange] = useState("7months");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Resume Analytics</h1>
            <p className="text-muted-foreground mt-1">Track your resume performance and application outcomes.</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="7months">Last 7 Months</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <stat.icon className="h-5 w-5 text-muted-foreground" />
                  <Badge variant={stat.up ? "default" : "destructive"} className="text-xs">
                    {stat.up ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                    {stat.change}
                  </Badge>
                </div>
                <p className="text-3xl font-bold mt-3">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Views, Downloads & Applications Over Time */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={viewsData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs fill-muted-foreground" />
                  <YAxis className="text-xs fill-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" strokeWidth={2} />
                  <Area type="monotone" dataKey="downloads" stroke="hsl(142 76% 36%)" fill="hsl(142 76% 36% / 0.2)" strokeWidth={2} />
                  <Area type="monotone" dataKey="applications" stroke="hsl(48 96% 53%)" fill="hsl(48 96% 53% / 0.2)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Application Outcomes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Application Outcomes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={outcomeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {outcomeData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {outcomeData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resume Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Resume Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {resumePerformance.map((r) => (
                  <div key={r.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{r.name}</p>
                      <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {r.views}</span>
                        <span className="flex items-center gap-1"><Download className="h-3 w-3" /> {r.downloads}</span>
                      </div>
                    </div>
                    <Badge variant={r.score >= 90 ? "default" : r.score >= 80 ? "secondary" : "outline"}>
                      {r.score}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Weekly Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" className="text-xs fill-muted-foreground" />
                  <YAxis className="text-xs fill-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Bar dataKey="actions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
