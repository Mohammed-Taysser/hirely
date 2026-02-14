import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// Mock data for charts
const resumeViewsData = [
  { date: 'Jan 1', views: 45, downloads: 12 },
  { date: 'Jan 8', views: 52, downloads: 18 },
  { date: 'Jan 15', views: 78, downloads: 24 },
  { date: 'Jan 22', views: 91, downloads: 32 },
  { date: 'Jan 29', views: 86, downloads: 28 },
  { date: 'Feb 5', views: 124, downloads: 45 },
  { date: 'Feb 12', views: 142, downloads: 52 },
];

const applicationStatsData = [
  { month: 'Oct', applied: 12, interviews: 4, offers: 1 },
  { month: 'Nov', applied: 18, interviews: 6, offers: 2 },
  { month: 'Dec', applied: 8, interviews: 3, offers: 0 },
  { month: 'Jan', applied: 24, interviews: 9, offers: 3 },
  { month: 'Feb', applied: 32, interviews: 12, offers: 4 },
];

const emailOpenRatesData = [
  { name: 'Opened', value: 68, color: 'hsl(var(--status-success))' },
  { name: 'Clicked', value: 24, color: 'hsl(var(--tier-pro))' },
  { name: 'No Action', value: 8, color: 'hsl(var(--muted-foreground))' },
];

const weeklyActivityData = [
  { day: 'Mon', edits: 8, exports: 3 },
  { day: 'Tue', edits: 12, exports: 5 },
  { day: 'Wed', edits: 6, exports: 2 },
  { day: 'Thu', edits: 15, exports: 7 },
  { day: 'Fri', edits: 9, exports: 4 },
  { day: 'Sat', edits: 4, exports: 1 },
  { day: 'Sun', edits: 2, exports: 0 },
];

export function AnalyticsCharts() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Resume Views Chart */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Resume Views & Downloads</CardTitle>
          <CardDescription>Track how your resumes are performing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={resumeViewsData}>
                <defs>
                  <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="downloadsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--tier-pro))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--tier-pro))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#viewsGradient)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="downloads"
                  stroke="hsl(var(--tier-pro))"
                  fillOpacity={1}
                  fill="url(#downloadsGradient)"
                  strokeWidth={2}
                />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Application Stats Chart */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Application Pipeline</CardTitle>
          <CardDescription>Your job application journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={applicationStatsData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="applied" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="interviews" fill="hsl(var(--tier-pro))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="offers" fill="hsl(var(--status-success))" radius={[4, 4, 0, 0]} />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Email Open Rates Chart */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Email Engagement</CardTitle>
          <CardDescription>How recipients interact with your emails</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={emailOpenRatesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {emailOpenRatesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Activity Chart */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Weekly Activity</CardTitle>
          <CardDescription>Your resume editing patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyActivityData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="edits"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
                <Line
                  type="monotone"
                  dataKey="exports"
                  stroke="hsl(var(--tier-premium))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--tier-premium))' }}
                />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
