import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  getClientCount,
  getMonthlyRevenue,
  getTestimonialCount,
} from '@/lib/queries/clients';
import {
  getTotalRevenue,
  getRevenueByMonth,
  getCompletedClientCount,
  getReferralSummary,
  getClientsByPricingTier,
  getClientsByServiceType,
  getAverageCompletionDays,
  getPipelineConversion,
  formatRevenue,
  formatMonthLabel,
  conversionRate,
} from '@/lib/queries/metrics';
import { DollarSign, Users, UserCheck, MessageSquareQuote, Share2, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MetricsPage({
  searchParams,
}: {
  searchParams: Promise<{ biz?: string }>;
}) {
  const { biz } = await searchParams;
  const businessType = biz === 'reset' ? 'reset' : 'salon';

  const totalRevenue = getTotalRevenue();
  const revenueByMonth = getRevenueByMonth();
  const revenueThisMonth = getMonthlyRevenue(businessType);
  const totalClients = getClientCount(businessType);
  const completedClients = getCompletedClientCount();
  const testimonialCount = getTestimonialCount(businessType);
  const referralSummary = getReferralSummary();
  const tierBreakdown = getClientsByPricingTier();
  const serviceTypeBreakdown = getClientsByServiceType();
  const avgDays = getAverageCompletionDays();
  const funnel = getPipelineConversion();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-brand-800">Metrics</h1>
        <p className="text-muted-foreground mt-1">Business health at a glance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          icon={<DollarSign size={20} className="text-sage-500" />}
          iconBg="bg-sage-100"
          label="Total Revenue"
          value={formatRevenue(totalRevenue)}
        />
        <MetricCard
          icon={<DollarSign size={20} className="text-brand-600" />}
          iconBg="bg-brand-100"
          label="Revenue This Month"
          value={formatRevenue(revenueThisMonth)}
        />
        <MetricCard
          icon={<Users size={20} className="text-brand-600" />}
          iconBg="bg-brand-100"
          label="Total Clients"
          value={String(totalClients)}
        />
        <MetricCard
          icon={<UserCheck size={20} className="text-sage-500" />}
          iconBg="bg-sage-100"
          label="Completed Clients"
          value={String(completedClients)}
        />
        <MetricCard
          icon={<MessageSquareQuote size={20} className="text-brand-600" />}
          iconBg="bg-brand-100"
          label="Testimonials"
          value={String(testimonialCount)}
        />
        <MetricCard
          icon={<Share2 size={20} className="text-sage-500" />}
          iconBg="bg-sage-100"
          label="Referrals Given"
          value={String(referralSummary.totalReferralsGiven)}
        />
      </div>

      {/* Pipeline Funnel + Average Completion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-brand-800">Pipeline Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            {totalClients === 0 ? (
              <p className="text-muted-foreground text-sm">No clients yet — funnel will populate as you add clients.</p>
            ) : (
              <div className="space-y-3">
                {funnel.map((stage, i) => (
                  <div key={stage.stageId} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-brand-700 font-medium">{stage.label}</span>
                      <span className="text-muted-foreground">
                        {stage.count} client{stage.count !== 1 ? 's' : ''}
                        {i > 0 && funnel[i - 1].count > 0 && (
                          <span className="ml-2 text-xs">
                            ({conversionRate(funnel[i - 1].count, stage.count)}% from prev)
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className="bg-brand-400 h-3 rounded-full transition-all"
                        style={{ width: `${Math.max(stage.percentage, stage.count > 0 ? 3 : 0)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-brand-800 flex items-center gap-2">
              <Clock size={20} />
              Avg. Completion Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {avgDays !== null ? (
              <div className="text-center py-4">
                <p className="text-4xl font-bold text-brand-600">{avgDays}</p>
                <p className="text-muted-foreground text-sm mt-1">days from inquiry to completion</p>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No completed clients yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Month */}
      <Card>
        <CardHeader>
          <CardTitle className="text-brand-800">Revenue by Month</CardTitle>
        </CardHeader>
        <CardContent>
          {revenueByMonth.length === 0 ? (
            <p className="text-muted-foreground text-sm">No revenue recorded yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Clients</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {revenueByMonth.map((row) => (
                  <TableRow key={row.month}>
                    <TableCell className="font-medium">{formatMonthLabel(row.month)}</TableCell>
                    <TableCell className="text-right">{formatRevenue(row.total)}</TableCell>
                    <TableCell className="text-right">{row.clientCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Client Breakdowns + Referral Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Pricing Tier + Service Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-brand-800">Client Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* By Pricing Tier */}
            <div>
              <h3 className="text-sm font-medium text-brand-700 mb-2">By Pricing Tier</h3>
              {tierBreakdown.length === 0 ? (
                <p className="text-muted-foreground text-sm">No clients yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tierBreakdown.map((item) => (
                    <Badge key={item.tier} variant="secondary" className="text-sm px-3 py-1">
                      {item.tier}: {item.count}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* By Service Type */}
            <div>
              <h3 className="text-sm font-medium text-brand-700 mb-2">By Service Type (Top 10)</h3>
              {serviceTypeBreakdown.length === 0 ? (
                <p className="text-muted-foreground text-sm">No service types recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {serviceTypeBreakdown.map((item) => (
                    <div key={item.serviceType} className="flex items-center justify-between text-sm">
                      <span className="text-brand-700">{item.serviceType}</span>
                      <Badge variant="outline">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Referral Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="text-brand-800">Referral Sources</CardTitle>
          </CardHeader>
          <CardContent>
            {referralSummary.referralSources.length === 0 ? (
              <p className="text-muted-foreground text-sm">No referral sources recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {referralSummary.referralSources.map((source) => (
                  <div key={source.source} className="flex items-center justify-between text-sm">
                    <span className="text-brand-700">{source.source}</span>
                    <Badge variant="outline">{source.count} client{source.count !== 1 ? 's' : ''}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ icon, iconBg, label, value }: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 ${iconBg} rounded-lg`}>
            {icon}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-brand-800">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
