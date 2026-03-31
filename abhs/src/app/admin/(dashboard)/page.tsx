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
import { getPendingIntakeCount } from '@/lib/queries/intake-queue';
import { formatRelativeDate } from '@/lib/date-utils';
import { Users, DollarSign, MessageSquareQuote, UserPlus, CalendarClock, AlertTriangle, TrendingUp, Inbox } from 'lucide-react';
import { TodaysAppointments } from '@/components/admin/todays-appointments';
import { ClientContactActions } from '@/components/clients/client-contact-actions';

export const dynamic = 'force-dynamic';

export default async function DashboardHome() {
  const statusCounts = getClientCountByStatus();
  const upcomingSessions = getUpcomingSessions(7);
  const overdueFollowups = getOverdueFollowups();
  const monthlyRevenue = getMonthlyRevenue();
  const testimonialCount = getTestimonialCount();
  const totalClients = getClientCount();
  const pendingIntakes = getPendingIntakeCount();

  return (
    <div className="space-y-8">
      {/* Intake Alert */}
      {pendingIntakes > 0 && (
        <Link href="/admin/intake">
          <Card className="border-amber-300 bg-amber-50 hover:bg-amber-100/80 transition-colors cursor-pointer">
            <CardContent className="py-4 flex items-center gap-3">
              <div className="p-2 bg-amber-200 rounded-lg">
                <Inbox size={20} className="text-amber-700" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-amber-800">
                  {pendingIntakes} New Consultation Submission{pendingIntakes !== 1 ? 's' : ''}
                </p>
                <p className="text-sm text-amber-600">Review and accept or decline new clients</p>
              </div>
              <span className="text-amber-600 text-sm font-medium">Review Now →</span>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-800">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Your business at a glance</p>
        </div>
        <Link
          href="/admin/clients/new"
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
                href={`/admin/pipeline?stage=${stage.id}`}
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

      {/* Today's Appointments */}
      <TodaysAppointments />

      {/* Command Center quick access */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/admin/engagement" className="group">
          <Card className="hover:border-copper-400 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sage-100 rounded-lg">
                  <TrendingUp size={20} className="text-sage-500" />
                </div>
                <div>
                  <p className="font-medium text-brand-700 group-hover:text-copper-500 transition-colors">Customer Insights</p>
                  <p className="text-xs text-muted-foreground">Visit history & engagement</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

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
                  <div key={client.id} className="p-3 rounded-lg bg-muted hover:bg-brand-100 transition-colors">
                    <Link
                      href={`/admin/session-prep/${client.id}`}
                      className="flex items-center justify-between"
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
                    <div className="mt-1.5">
                      <ClientContactActions
                        email={client.q03_email}
                        phone={client.phone}
                        preferredContact={client.preferred_contact}
                        variant="compact"
                      />
                    </div>
                  </div>
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
                  <div key={client.id} className="p-3 rounded-lg bg-red-50 hover:bg-red-100 transition-colors">
                    <Link
                      href={`/admin/clients/${client.id}`}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-brand-800">{client.q02_client_name}</p>
                        <p className="text-xs text-muted-foreground">{client.q01_business_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-status-overdue">{formatRelativeDate(client.followup_date)}</p>
                      </div>
                    </Link>
                    <div className="mt-1.5">
                      <ClientContactActions
                        email={client.q03_email}
                        phone={client.phone}
                        preferredContact={client.preferred_contact}
                        variant="compact"
                      />
                    </div>
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
