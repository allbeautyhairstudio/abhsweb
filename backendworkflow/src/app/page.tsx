import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  getClientCountByStatus,
  getUpcomingSessions,
  getOverdueFollowups,
  getMonthlyRevenue,
  getTestimonialCount,
  getClientCount,
} from '@/lib/queries/clients';
import { PIPELINE_STAGES } from '@/lib/constants/stages';
import { formatRelativeDate } from '@/lib/date-utils';
import { Users, DollarSign, MessageSquareQuote, UserPlus, CalendarClock, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function DashboardHome() {
  const statusCounts = getClientCountByStatus();
  const upcomingSessions = getUpcomingSessions();
  const overdueFollowups = getOverdueFollowups();
  const monthlyRevenue = getMonthlyRevenue();
  const testimonialCount = getTestimonialCount();
  const totalClients = getClientCount();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-800">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Your business at a glance</p>
        </div>
        <Link
          href="/clients/new"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-medium hover:bg-brand-600 transition-colors self-start sm:self-auto"
        >
          <UserPlus size={18} />
          New Client
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-100 rounded-lg">
                <Users size={20} className="text-brand-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold text-brand-800">{totalClients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sage-100 rounded-lg">
                <DollarSign size={20} className="text-sage-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenue This Month</p>
                <p className="text-2xl font-bold text-brand-800">${monthlyRevenue.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-100 rounded-lg">
                <MessageSquareQuote size={20} className="text-brand-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Testimonials</p>
                <p className="text-2xl font-bold text-brand-800">{testimonialCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-100 rounded-lg">
                <CalendarClock size={20} className="text-brand-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Upcoming Sessions</p>
                <p className="text-2xl font-bold text-brand-800">{upcomingSessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-brand-800">Pipeline Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {PIPELINE_STAGES.map((stage) => (
              <Link
                key={stage.id}
                href={`/pipeline?stage=${stage.id}`}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-brand-100 transition-colors"
              >
                <span className="text-sm font-medium text-brand-700">{stage.label}</span>
                <Badge variant="secondary" className="bg-brand-200 text-brand-800">
                  {statusCounts[stage.id] || 0}
                </Badge>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-brand-800 flex items-center gap-2">
              <CalendarClock size={20} />
              Upcoming Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingSessions.length === 0 ? (
              <p className="text-muted-foreground text-sm">No sessions scheduled in the next 7 days</p>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.map((client) => (
                  <Link
                    key={client.id}
                    href={`/session-prep/${client.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-brand-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-brand-800">{client.q02_client_name}</p>
                      <p className="text-xs text-muted-foreground">{client.q01_business_name} — {client.q05_service_type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-brand-600">{formatRelativeDate(client.session_date)}</p>
                      <p className="text-xs text-muted-foreground">Session Prep →</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overdue Follow-ups */}
        <Card>
          <CardHeader>
            <CardTitle className="text-brand-800 flex items-center gap-2">
              <AlertTriangle size={20} className="text-status-overdue" />
              Overdue Follow-Ups
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overdueFollowups.length === 0 ? (
              <p className="text-muted-foreground text-sm">No overdue follow-ups — you&apos;re all caught up!</p>
            ) : (
              <div className="space-y-3">
                {overdueFollowups.map((client) => (
                  <Link
                    key={client.id}
                    href={`/clients/${client.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-brand-800">{client.q02_client_name}</p>
                      <p className="text-xs text-muted-foreground">{client.q01_business_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-status-overdue">{formatRelativeDate(client.followup_date)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
