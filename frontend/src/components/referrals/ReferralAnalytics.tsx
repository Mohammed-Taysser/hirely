import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  FunnelChart,
  Funnel,
  LabelList,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { TrendingUp, Users, Target, Share2, Mail, Linkedin, Twitter, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock analytics data
const conversionData = [
  { stage: "Link Clicks", value: 245, fill: "hsl(var(--primary))" },
  { stage: "Sign Ups", value: 87, fill: "hsl(var(--chart-2))" },
  { stage: "Activated", value: 52, fill: "hsl(var(--chart-3))" },
  { stage: "Subscribed", value: 23, fill: "hsl(var(--chart-4))" },
];

const channelData = [
  { name: "Direct Link", clicks: 120, signups: 45, conversions: 12, color: "hsl(var(--primary))" },
  { name: "Email", clicks: 65, signups: 28, conversions: 8, color: "hsl(var(--chart-2))" },
  { name: "LinkedIn", clicks: 40, signups: 10, conversions: 2, color: "hsl(var(--chart-3))" },
  { name: "Twitter", clicks: 20, signups: 4, conversions: 1, color: "hsl(var(--chart-4))" },
];

const weeklyTrends = [
  { week: "W1", clicks: 35, signups: 12, conversions: 3 },
  { week: "W2", clicks: 48, signups: 18, conversions: 5 },
  { week: "W3", clicks: 62, signups: 24, conversions: 8 },
  { week: "W4", clicks: 55, signups: 20, conversions: 4 },
  { week: "W5", clicks: 45, signups: 13, conversions: 3 },
];

const channelIcons: Record<string, React.ElementType> = {
  "Direct Link": Link2,
  "Email": Mail,
  "LinkedIn": Linkedin,
  "Twitter": Twitter,
};

export function ReferralAnalytics() {
  const totalClicks = channelData.reduce((sum, c) => sum + c.clicks, 0);
  const totalSignups = channelData.reduce((sum, c) => sum + c.signups, 0);
  const totalConversions = channelData.reduce((sum, c) => sum + c.conversions, 0);
  const overallConversionRate = ((totalConversions / totalClicks) * 100).toFixed(1);
  const signupRate = ((totalSignups / totalClicks) * 100).toFixed(1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Referral Analytics
        </CardTitle>
        <CardDescription>
          Track your referral performance and optimize your strategy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Conversion Rate</span>
            </div>
            <p className="text-2xl font-bold mt-1">{overallConversionRate}%</p>
            <p className="text-xs text-muted-foreground">Clicks to subscriptions</p>
          </div>
          <div className="p-4 rounded-lg bg-muted">
            <div className="flex items-center gap-2">
              <Share2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Clicks</span>
            </div>
            <p className="text-2xl font-bold mt-1">{totalClicks}</p>
            <p className="text-xs text-muted-foreground">All time</p>
          </div>
          <div className="p-4 rounded-lg bg-muted">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Sign Up Rate</span>
            </div>
            <p className="text-2xl font-bold mt-1">{signupRate}%</p>
            <p className="text-xs text-muted-foreground">Clicks to sign ups</p>
          </div>
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Total Conversions</span>
            </div>
            <p className="text-2xl font-bold mt-1">{totalConversions}</p>
            <p className="text-xs text-muted-foreground">Paid subscribers</p>
          </div>
        </div>

        <Tabs defaultValue="funnel" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
            <TabsTrigger value="channels">Channel Performance</TabsTrigger>
            <TabsTrigger value="trends">Weekly Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="funnel" className="pt-4">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-4">Referral Funnel</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <FunnelChart>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Funnel
                      dataKey="value"
                      data={conversionData}
                      isAnimationActive
                    >
                      <LabelList position="right" fill="hsl(var(--foreground))" stroke="none" dataKey="stage" />
                      <LabelList position="center" fill="#fff" stroke="none" dataKey="value" />
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium">Stage Breakdown</h4>
                {conversionData.map((stage, index) => {
                  const prevValue = index === 0 ? stage.value : conversionData[index - 1].value;
                  const dropRate = index === 0 ? 0 : (((prevValue - stage.value) / prevValue) * 100).toFixed(1);
                  return (
                    <div key={stage.stage} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: stage.fill }}
                        />
                        <span className="font-medium">{stage.stage}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{stage.value}</span>
                        {index > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            -{dropRate}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="channels" className="pt-4">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-4">Clicks by Channel</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={channelData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="clicks"
                    >
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium">Channel Details</h4>
                {channelData.map((channel) => {
                  const Icon = channelIcons[channel.name] || Share2;
                  const convRate = ((channel.conversions / channel.clicks) * 100).toFixed(1);
                  return (
                    <div key={channel.name} className="p-3 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div 
                            className="h-8 w-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${channel.color}20` }}
                          >
                            <Icon className="h-4 w-4" style={{ color: channel.color }} />
                          </div>
                          <span className="font-medium">{channel.name}</span>
                        </div>
                        <Badge 
                          variant="outline"
                          className="text-xs"
                          style={{ borderColor: channel.color, color: channel.color }}
                        >
                          {convRate}% conv.
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{channel.clicks} clicks</span>
                        <span>{channel.signups} signups</span>
                        <span>{channel.conversions} subs</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="pt-4">
            <div>
              <h4 className="font-medium mb-4">Weekly Performance</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyTrends}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="week" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="clicks" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="signups" 
                    stroke="hsl(var(--chart-2))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-2))" }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="conversions" 
                    stroke="hsl(var(--chart-4))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-4))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
