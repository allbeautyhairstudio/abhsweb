'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MessageSquare,
  X,
  Loader2,
  AlertTriangle,
  Plus,
  Check,
} from 'lucide-react';
import type { BookingSummary, BookingRequest, BookableService, TeamMember } from '@/lib/booking-types';

type ViewMode = 'week' | 'day' | 'month' | 'year';

/** Unified calendar item — can be a Square booking or a local request. */
interface CalendarItem {
  source: 'square' | 'local';
  itemId: string;
  startAt: string;
  durationMinutes: number;
  serviceName: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerNote: string;
  status: string;
  createdAt: string;
  squareVersion?: number;
  teamMemberName?: string;
  requestId?: number;
}

/** Convert a Square booking to a CalendarItem */
function squareToCalendarItem(b: BookingSummary): CalendarItem {
  return {
    source: 'square',
    itemId: b.id,
    startAt: b.startAt,
    durationMinutes: b.durationMinutes,
    serviceName: b.serviceName,
    customerName: b.customerName,
    customerPhone: b.customerPhone,
    customerEmail: b.customerEmail,
    customerNote: b.customerNote,
    status: b.status,
    createdAt: b.createdAt,
    squareVersion: b.version,
    teamMemberName: b.teamMemberName,
  };
}

/** Convert a local booking request to a CalendarItem */
function requestToCalendarItem(r: BookingRequest): CalendarItem {
  const serviceNames = r.segments.map((s) => s.serviceName).join(', ');
  return {
    source: 'local',
    itemId: `request-${r.id}`,
    startAt: r.requestedStartAt,
    durationMinutes: r.totalDurationMin,
    serviceName: serviceNames,
    customerName: `${r.customerFirstName} ${r.customerLastName}`,
    customerPhone: r.customerPhone,
    customerEmail: r.customerEmail,
    customerNote: r.customerNote ?? '',
    status: 'AWAITING_APPROVAL',
    createdAt: r.createdAt,
    requestId: r.id,
  };
}

/** Format time for display: "10:00 AM" */
function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/** Format date for header: "Mon 3" */
function formatDayHeader(date: Date): { day: string; num: number } {
  return {
    day: date.toLocaleDateString('en-US', { weekday: 'short' }),
    num: date.getDate(),
  };
}

/** Get Monday of the week containing the given date */
function getMonday(date: Date): Date {
  const d = new Date(date);
  const dayOfWeek = d.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** YYYY-MM-DD from a Date */
function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Check if two dates are the same day */
function isSameDay(a: Date, b: Date): boolean {
  return toDateStr(a) === toDateStr(b);
}

/** Business hours range for day view display */
const HOUR_START = 10; // 10 AM
const HOUR_END = 20; // 8 PM
const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);

/** Working days (Tue=2, Wed=3, Thu=4) */
const WORKING_DAYS = [2, 3, 4];

/** Get all days to display in a month grid (Mon-Sun weeks, includes overflow from adjacent months) */
function getMonthGridDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Start from Monday of the week containing the 1st
  const startDay = getMonday(firstDay);

  // End on Sunday of the week containing the last day
  const endDay = new Date(lastDay);
  const endDow = endDay.getDay();
  if (endDow !== 0) {
    endDay.setDate(endDay.getDate() + (7 - endDow));
  }

  const days: Date[] = [];
  const d = new Date(startDay);
  while (d <= endDay) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

/** Convert hour + minutes to a time string */
function minutesToTimeLabel(totalMin: number): string {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

export function CalendarView() {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [declineReason, setDeclineReason] = useState('');

  // New booking form state
  const [createMode, setCreateMode] = useState(false);
  const [createDate, setCreateDate] = useState('');
  const [createTime, setCreateTime] = useState('');
  const [services, setServices] = useState<BookableService[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [createForm, setCreateForm] = useState({
    serviceVariationId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    note: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monday = getMonday(currentDate);
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const currentDateStr = toDateStr(currentDate);
  const mondayStr = toDateStr(monday);

  // Fetch services on mount
  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch('/api/booking/services');
        if (res.ok) {
          const data = await res.json();
          setServices(data.services ?? []);
          setTeamMembers(data.teamMembers ?? []);
        }
      } catch { /* non-critical */ }
    }
    fetchServices();
  }, []);

  // Fetch bookings + local requests for current view range
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      let startDate: string;
      let endDate: string;

      if (viewMode === 'year') {
        const year = currentDate.getFullYear();
        startDate = `${year}-01-01`;
        endDate = `${year}-12-31`;
      } else if (viewMode === 'month') {
        const gridDays = getMonthGridDays(currentDate.getFullYear(), currentDate.getMonth());
        startDate = toDateStr(gridDays[0]);
        endDate = toDateStr(gridDays[gridDays.length - 1]);
      } else if (viewMode === 'week') {
        const mon = getMonday(new Date(mondayStr + 'T12:00:00'));
        startDate = toDateStr(mon);
        const sunday = new Date(mon);
        sunday.setDate(mon.getDate() + 6);
        endDate = toDateStr(sunday);
      } else {
        startDate = currentDateStr;
        endDate = currentDateStr;
      }

      const [squareRes, requestsRes] = await Promise.all([
        fetch(`/api/admin/bookings?startDate=${startDate}&endDate=${endDate}`),
        fetch(`/api/admin/booking-requests?startDate=${startDate}&endDate=${endDate}`),
      ]);

      const items: CalendarItem[] = [];

      if (squareRes.ok) {
        const squareData = await squareRes.json();
        for (const b of squareData.bookings ?? []) {
          const st = (b.status ?? '') as string;
          if (st.startsWith('CANCELLED') || st === 'DECLINED' || st === 'NO_SHOW') continue;
          items.push(squareToCalendarItem(b));
        }
      }

      if (requestsRes.ok) {
        const requestsData = await requestsRes.json();
        for (const r of requestsData.requests ?? []) {
          items.push(requestToCalendarItem(r));
        }
      }

      setCalendarItems(items);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [viewMode, currentDateStr, mondayStr]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Navigation
  function navigate(direction: 'prev' | 'next') {
    const d = new Date(currentDate);
    if (viewMode === 'year') {
      d.setFullYear(d.getFullYear() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'month') {
      d.setMonth(d.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      d.setDate(d.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      d.setDate(d.getDate() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(d);
  }

  function goToday() {
    setCurrentDate(new Date());
  }

  // Close any panel
  function closePanel() {
    setSelectedItem(null);
    setCreateMode(false);
    setCancelConfirm(false);
    setActionError('');
    setDeclineReason('');
    setCreateError('');
    setCreateSuccess('');
  }

  // Open create form for a specific date/time
  function openCreateForm(date: string, timeMinutes?: number) {
    const dayOfWeek = new Date(date + 'T12:00:00').getDay();
    if (!WORKING_DAYS.includes(dayOfWeek)) {
      setCreateError('This is outside of working hours.');
      setCreateMode(true);
      setCreateDate(date);
      setCreateTime('');
      setSelectedItem(null);
      return;
    }

    setSelectedItem(null);
    setCreateMode(true);
    setCreateDate(date);
    setCreateTime(timeMinutes !== undefined ? minutesToTimeLabel(timeMinutes) : '');
    setCreateForm({ serviceVariationId: '', firstName: '', lastName: '', email: '', phone: '', note: '' });
    setCreateError('');
    setCreateSuccess('');
  }

  // Handle day view click on empty area
  function handleDayViewClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    // Don't trigger if clicking on a booking block
    if (target.closest('[data-booking-item]')) return;

    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const pct = y / rect.height;
    const totalMinutes = HOUR_START * 60 + pct * (HOUR_END - HOUR_START) * 60;
    // Snap to 15-minute intervals
    const snapped = Math.round(totalMinutes / 15) * 15;
    const clamped = Math.max(HOUR_START * 60, Math.min(snapped, HOUR_END * 60 - 15));

    openCreateForm(currentDateStr, clamped);
  }

  // Create booking handler
  async function handleCreateBooking() {
    setCreateLoading(true);
    setCreateError('');
    setCreateSuccess('');

    try {
      // Find the selected service
      const service = services.find((s) => s.variationId === createForm.serviceVariationId);
      if (!service) {
        setCreateError('Please select a service.');
        setCreateLoading(false);
        return;
      }

      if (!createForm.firstName || !createForm.lastName || !createForm.email || !createForm.phone) {
        setCreateError('Please fill in all customer fields.');
        setCreateLoading(false);
        return;
      }

      if (!createTime) {
        setCreateError('Please select a time.');
        setCreateLoading(false);
        return;
      }

      // Parse time to ISO
      const timeParts = createTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (!timeParts) {
        setCreateError('Invalid time format.');
        setCreateLoading(false);
        return;
      }
      let hours = parseInt(timeParts[1], 10);
      const mins = parseInt(timeParts[2], 10);
      const period = timeParts[3].toUpperCase();
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;

      // Enforce: service must end by 8 PM (20:00)
      const endMinutes = hours * 60 + mins + service.durationMinutes;
      if (endMinutes > HOUR_END * 60) {
        setCreateError(`This service (${service.durationMinutes} min) would end after 8 PM. Please pick an earlier time.`);
        setCreateLoading(false);
        return;
      }

      // Build ISO start time (Pacific)
      const offsetDate = new Date(`${createDate}T12:00:00Z`);
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Los_Angeles',
        timeZoneName: 'shortOffset',
      }).formatToParts(offsetDate);
      const tzPart = parts.find((p) => p.type === 'timeZoneName');
      const offset = tzPart?.value?.includes('-7') ? '-07:00' : '-08:00';
      const startAt = `${createDate}T${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00${offset}`;

      const teamMemberId = teamMembers[0]?.id ?? '';

      const res = await fetch('/api/admin/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceVariationId: service.variationId,
          serviceVariationVersion: service.variationVersion,
          startAt,
          teamMemberId,
          durationMinutes: service.durationMinutes,
          customer: {
            firstName: createForm.firstName,
            lastName: createForm.lastName,
            email: createForm.email,
            phone: createForm.phone,
            note: createForm.note || undefined,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCreateSuccess(`Booked ${data.booking?.customerName} for ${data.booking?.serviceName}`);
        setCreateForm({ serviceVariationId: '', firstName: '', lastName: '', email: '', phone: '', note: '' });
        fetchBookings();
      } else {
        const data = await res.json().catch(() => null);
        setCreateError(data?.error || 'Unable to create booking.');
      }
    } catch {
      setCreateError('Connection error. Please try again.');
    } finally {
      setCreateLoading(false);
    }
  }

  // Cancel a Square booking
  async function handleCancel() {
    if (!selectedItem || selectedItem.source !== 'square') return;
    setActionLoading(true);
    setActionError('');

    try {
      const res = await fetch(
        `/api/admin/bookings/${selectedItem.itemId}/cancel`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ version: selectedItem.squareVersion }),
        }
      );

      if (res.ok) {
        setCancelConfirm(false);
        setSelectedItem(null);
        fetchBookings();
      } else {
        const data = await res.json().catch(() => null);
        setActionError(data?.error || 'Unable to cancel booking.');
      }
    } catch {
      setActionError('Connection error. Please try again.');
    } finally {
      setActionLoading(false);
    }
  }

  // Get items for a specific day
  function getItemsForDay(date: Date): CalendarItem[] {
    const dateStr = toDateStr(date);
    return calendarItems.filter((item) => {
      const itemDate = new Date(item.startAt);
      return toDateStr(itemDate) === dateStr;
    });
  }

  // Calculate position for a booking block in day view
  function getItemPosition(item: CalendarItem): { top: string; height: string } {
    const start = new Date(item.startAt);
    const startHour = start.getHours() + start.getMinutes() / 60;
    const topOffset = ((startHour - HOUR_START) / (HOUR_END - HOUR_START)) * 100;
    const heightPct = (item.durationMinutes / 60 / (HOUR_END - HOUR_START)) * 100;
    return {
      top: `${Math.max(0, topOffset)}%`,
      height: `${Math.max(2, heightPct)}%`,
    };
  }

  // Accept/approve a Square PENDING booking
  async function handleAcceptSquare() {
    if (!selectedItem || selectedItem.source !== 'square') return;
    setActionLoading(true);
    setActionError('');

    try {
      const res = await fetch(
        `/api/admin/bookings/${selectedItem.itemId}/accept`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ version: selectedItem.squareVersion }),
        }
      );

      if (res.ok) {
        setSelectedItem(null);
        fetchBookings();
      } else {
        const data = await res.json().catch(() => null);
        setActionError(data?.error || 'Unable to accept booking.');
      }
    } catch {
      setActionError('Connection error. Please try again.');
    } finally {
      setActionLoading(false);
    }
  }

  // Approve a local booking request
  async function handleApproveRequest() {
    if (!selectedItem || selectedItem.source !== 'local' || !selectedItem.requestId) return;
    setActionLoading(true);
    setActionError('');

    try {
      const res = await fetch(
        `/api/admin/booking-requests/${selectedItem.requestId}/approve`,
        { method: 'POST' }
      );

      if (res.ok) {
        setSelectedItem(null);
        fetchBookings();
      } else {
        const data = await res.json().catch(() => null);
        setActionError(data?.error || 'Unable to approve request.');
      }
    } catch {
      setActionError('Connection error. Please try again.');
    } finally {
      setActionLoading(false);
    }
  }

  // Decline a local booking request
  async function handleDeclineRequest() {
    if (!selectedItem || selectedItem.source !== 'local' || !selectedItem.requestId) return;
    setActionLoading(true);
    setActionError('');

    try {
      const res = await fetch(
        `/api/admin/booking-requests/${selectedItem.requestId}/decline`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: declineReason || undefined }),
        }
      );

      if (res.ok) {
        setCancelConfirm(false);
        setSelectedItem(null);
        setDeclineReason('');
        fetchBookings();
      } else {
        const data = await res.json().catch(() => null);
        setActionError(data?.error || 'Unable to decline request.');
      }
    } catch {
      setActionError('Connection error. Please try again.');
    } finally {
      setActionLoading(false);
    }
  }

  // Decline a Square PENDING booking
  async function handleDeclineSquare() {
    if (!selectedItem || selectedItem.source !== 'square') return;
    setActionLoading(true);
    setActionError('');

    try {
      const res = await fetch(
        `/api/admin/bookings/${selectedItem.itemId}/cancel`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ version: selectedItem.squareVersion }),
        }
      );

      if (res.ok) {
        setCancelConfirm(false);
        setSelectedItem(null);
        fetchBookings();
      } else {
        const data = await res.json().catch(() => null);
        setActionError(data?.error || 'Unable to decline booking.');
      }
    } catch {
      setActionError('Connection error. Please try again.');
    } finally {
      setActionLoading(false);
    }
  }

  // Status colors
  function getStatusColor(status: string): string {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-forest-500 text-white';
      case 'PENDING':
        return 'bg-amber-400 text-white';
      case 'AWAITING_APPROVAL':
        return 'bg-amber-100 text-amber-800 border-2 border-dashed border-amber-400';
      case 'CANCELLED_BY_SELLER':
      case 'CANCELLED_BY_BUYER':
        return 'bg-warm-200 text-warm-500 line-through';
      case 'DECLINED':
        return 'bg-red-100 text-red-600 line-through';
      case 'NO_SHOW':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-sage-100 text-sage-700';
    }
  }

  // Generate available time slots for the create form dropdown
  function getAvailableTimesForDate(dateStr: string): string[] {
    const dayItems = calendarItems.filter((item) => {
      const itemDate = new Date(item.startAt);
      return toDateStr(itemDate) === dateStr;
    });

    const busyBlocks = dayItems.map((item) => {
      const start = new Date(item.startAt);
      const startMin = start.getHours() * 60 + start.getMinutes();
      return { start: startMin, end: startMin + item.durationMinutes };
    });

    const selectedService = services.find((s) => s.variationId === createForm.serviceVariationId);
    const duration = selectedService?.durationMinutes ?? 60;

    const slots: string[] = [];
    for (let min = HOUR_START * 60; min + duration <= HOUR_END * 60; min += 15) {
      const overlaps = busyBlocks.some(
        (block) => min < block.end && min + duration > block.start
      );
      if (!overlaps) {
        slots.push(minutesToTimeLabel(min));
      }
    }
    return slots;
  }

  // Header date range label
  const headerLabel =
    viewMode === 'year'
      ? `${currentDate.getFullYear()}`
      : viewMode === 'month'
        ? currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : viewMode === 'week'
        ? `${weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
        : currentDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          });

  const showPanel = selectedItem || createMode;

  return (
    <div className="relative">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('prev')}
            aria-label={viewMode === 'year' ? 'Previous year' : viewMode === 'month' ? 'Previous month' : viewMode === 'week' ? 'Previous week' : 'Previous day'}
            className="p-2 rounded-lg hover:bg-warm-100 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => navigate('next')}
            aria-label={viewMode === 'year' ? 'Next year' : viewMode === 'month' ? 'Next month' : viewMode === 'week' ? 'Next week' : 'Next day'}
            className="p-2 rounded-lg hover:bg-warm-100 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={goToday}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-forest-500 text-white hover:bg-forest-600 transition-colors"
          >
            Today
          </button>
          <h2 className="text-sm font-medium text-warm-600 ml-2">
            {headerLabel}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openCreateForm(currentDateStr)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-forest-500 text-white hover:bg-forest-600 transition-colors"
          >
            <Plus size={14} />
            New Booking
          </button>

          <div className="flex items-center gap-1 bg-warm-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('year')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'year'
                  ? 'bg-white text-warm-700 shadow-sm'
                  : 'text-warm-500 hover:text-warm-700'
              }`}
            >
              Year
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'month'
                  ? 'bg-white text-warm-700 shadow-sm'
                  : 'text-warm-500 hover:text-warm-700'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'week'
                  ? 'bg-white text-warm-700 shadow-sm'
                  : 'text-warm-500 hover:text-warm-700'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'day'
                  ? 'bg-white text-warm-700 shadow-sm'
                  : 'text-warm-500 hover:text-warm-700'
              }`}
            >
              Day
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-forest-500" />
          <span className="ml-2 text-sm text-warm-400">Loading calendar...</span>
        </div>
      )}

      {!loading && viewMode === 'week' && (
        /* ---- WEEK VIEW ---- */
        <div className="border border-warm-200 rounded-xl overflow-hidden bg-white">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-warm-200">
            {weekDates.map((date) => {
              const { day, num } = formatDayHeader(date);
              const isToday = isSameDay(date, today);
              const isWorkingDay = WORKING_DAYS.includes(date.getDay());

              return (
                <button
                  key={toDateStr(date)}
                  onClick={() => {
                    setCurrentDate(date);
                    setViewMode('day');
                  }}
                  className={`py-3 text-center border-r border-warm-100 last:border-r-0 hover:bg-warm-50 transition-colors ${
                    isToday ? 'bg-forest-50' : !isWorkingDay ? 'bg-warm-50/50' : ''
                  }`}
                >
                  <div className={`text-[10px] uppercase tracking-wider ${isWorkingDay ? 'text-warm-400' : 'text-warm-300'}`}>
                    {day}
                  </div>
                  <div
                    className={`text-lg font-semibold mt-0.5 ${
                      isToday
                        ? 'text-forest-600'
                        : isWorkingDay ? 'text-warm-600' : 'text-warm-300'
                    }`}
                  >
                    {num}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Booking cards per day */}
          <div className="grid grid-cols-7 min-h-[300px]">
            {weekDates.map((date) => {
              const dayItems = getItemsForDay(date);
              const isToday = isSameDay(date, today);
              const isWorkingDay = WORKING_DAYS.includes(date.getDay());

              return (
                <div
                  key={toDateStr(date)}
                  className={`border-r border-warm-100 last:border-r-0 p-1.5 space-y-1 ${
                    isToday ? 'bg-forest-50/30' : !isWorkingDay ? 'bg-warm-50/30' : ''
                  }`}
                >
                  {dayItems.map((item) => (
                    <button
                      key={item.itemId}
                      onClick={() => setSelectedItem(item)}
                      className={`w-full text-left p-2 rounded-lg text-xs transition-all hover:shadow-md cursor-pointer ${getStatusColor(item.status)}`}
                    >
                      <div className="font-medium truncate">
                        {formatTime(item.startAt)}
                      </div>
                      <div className="truncate opacity-80">
                        {item.customerName}
                      </div>
                      <div className="truncate opacity-70 text-[10px]">
                        {item.source === 'local' ? 'Awaiting Approval' : item.serviceName}
                      </div>
                    </button>
                  ))}
                  {isWorkingDay && (
                    <button
                      onClick={() => openCreateForm(toDateStr(date))}
                      className="w-full flex items-center justify-center gap-1 p-2 rounded-lg text-xs text-warm-400 hover:text-forest-600 hover:bg-forest-50 transition-colors border border-dashed border-warm-200 hover:border-forest-300"
                    >
                      <Plus size={12} />
                      Add
                    </button>
                  )}
                  {!isWorkingDay && dayItems.length === 0 && (
                    <div className="text-[10px] text-warm-300 text-center py-4">
                      &mdash;
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!loading && viewMode === 'year' && (
        /* ---- YEAR VIEW — 12 mini months ---- */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }, (_, monthIdx) => {
            const year = currentDate.getFullYear();
            const gridDays = getMonthGridDays(year, monthIdx);
            const monthName = new Date(year, monthIdx, 1).toLocaleDateString('en-US', { month: 'long' });
            const dayLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

            return (
              <div
                key={monthIdx}
                className="border border-warm-200 rounded-xl overflow-hidden bg-white"
              >
                {/* Month header — clickable to switch to month view */}
                <button
                  onClick={() => {
                    setCurrentDate(new Date(year, monthIdx, 1));
                    setViewMode('month');
                  }}
                  className="w-full px-3 py-2 text-sm font-semibold text-warm-700 hover:bg-forest-50 transition-colors text-left"
                >
                  {monthName}
                </button>

                {/* Day letters header */}
                <div className="grid grid-cols-7 px-1">
                  {dayLetters.map((letter, i) => (
                    <div
                      key={i}
                      className="text-center text-[9px] text-warm-400 py-0.5"
                    >
                      {letter}
                    </div>
                  ))}
                </div>

                {/* Mini day grid */}
                <div className="grid grid-cols-7 px-1 pb-1">
                  {gridDays.map((date) => {
                    const dateStr = toDateStr(date);
                    const isCurrentMonth = date.getMonth() === monthIdx;
                    const isToday = isSameDay(date, today);
                    const dayItems = getItemsForDay(date);
                    const hasBookings = dayItems.length > 0;
                    const hasPending = dayItems.some(
                      (it) => it.status === 'AWAITING_APPROVAL' || it.status === 'PENDING'
                    );

                    return (
                      <button
                        key={dateStr}
                        onClick={() => {
                          setCurrentDate(date);
                          setViewMode('day');
                        }}
                        className={`relative flex items-center justify-center h-6 text-[10px] rounded transition-colors ${
                          !isCurrentMonth
                            ? 'text-warm-200'
                            : isToday
                              ? 'bg-forest-500 text-white font-bold'
                              : 'text-warm-600 hover:bg-warm-100'
                        }`}
                        title={
                          hasBookings
                            ? `${dayItems.length} appointment${dayItems.length > 1 ? 's' : ''}`
                            : undefined
                        }
                      >
                        {date.getDate()}
                        {/* Dot indicator for bookings */}
                        {hasBookings && isCurrentMonth && !isToday && (
                          <span
                            className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                              hasPending ? 'bg-amber-400' : 'bg-forest-500'
                            }`}
                          />
                        )}
                        {hasBookings && isToday && (
                          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && viewMode === 'month' && (
        /* ---- MONTH VIEW ---- */
        (() => {
          const gridDays = getMonthGridDays(currentDate.getFullYear(), currentDate.getMonth());
          const currentMonth = currentDate.getMonth();
          const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

          return (
            <div className="border border-warm-200 rounded-xl overflow-hidden bg-white">
              {/* Day of week headers */}
              <div className="grid grid-cols-7 border-b border-warm-200">
                {dayNames.map((name) => (
                  <div
                    key={name}
                    className="py-2 text-center text-[10px] uppercase tracking-wider text-warm-400 font-medium"
                  >
                    {name}
                  </div>
                ))}
              </div>

              {/* Day cells grid */}
              <div className="grid grid-cols-7">
                {gridDays.map((date) => {
                  const dateStr = toDateStr(date);
                  const dayItems = getItemsForDay(date);
                  const isCurrentMonth = date.getMonth() === currentMonth;
                  const isToday = isSameDay(date, today);
                  const isWorkingDay = WORKING_DAYS.includes(date.getDay());

                  return (
                    <div
                      key={dateStr}
                      className={`border-b border-r border-warm-100 min-h-[90px] p-1 ${
                        !isCurrentMonth
                          ? 'bg-warm-50/50'
                          : isToday
                            ? 'bg-forest-50/40'
                            : !isWorkingDay
                              ? 'bg-warm-50/30'
                              : ''
                      }`}
                    >
                      {/* Day number */}
                      <button
                        onClick={() => {
                          setCurrentDate(date);
                          setViewMode('day');
                        }}
                        className={`w-6 h-6 flex items-center justify-center rounded-full text-xs mb-0.5 transition-colors hover:bg-forest-100 ${
                          isToday
                            ? 'bg-forest-500 text-white font-bold'
                            : isCurrentMonth
                              ? 'text-warm-600 font-medium'
                              : 'text-warm-300'
                        }`}
                      >
                        {date.getDate()}
                      </button>

                      {/* Compact booking indicators */}
                      <div className="space-y-0.5">
                        {dayItems.slice(0, 3).map((item) => (
                          <button
                            key={item.itemId}
                            onClick={() => setSelectedItem(item)}
                            className={`w-full text-left px-1 py-0.5 rounded text-[10px] leading-tight truncate transition-all hover:shadow-sm cursor-pointer ${getStatusColor(item.status)}`}
                          >
                            {formatTime(item.startAt)} {item.customerName.split(' ')[0]}
                          </button>
                        ))}
                        {dayItems.length > 3 && (
                          <button
                            onClick={() => {
                              setCurrentDate(date);
                              setViewMode('day');
                            }}
                            className="w-full text-left px-1 text-[10px] text-forest-600 font-medium hover:underline"
                          >
                            +{dayItems.length - 3} more
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()
      )}

      {!loading && viewMode === 'day' && (
        /* ---- DAY VIEW ---- */
        <div className="border border-warm-200 rounded-xl overflow-hidden bg-white">
          <div
            className="relative cursor-pointer"
            style={{ height: `${HOURS.length * 60}px` }}
            onClick={handleDayViewClick}
          >
            {/* Hour grid lines */}
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="absolute left-0 right-0 border-t border-warm-100 flex"
                style={{
                  top: `${((hour - HOUR_START) / (HOUR_END - HOUR_START)) * 100}%`,
                }}
              >
                <span className="text-[10px] text-warm-400 px-2 py-0.5 w-14 shrink-0">
                  {hour === 12
                    ? '12 PM'
                    : hour > 12
                      ? `${hour - 12} PM`
                      : `${hour} AM`}
                </span>
              </div>
            ))}

            {/* Booking blocks */}
            <div className="absolute left-14 right-2 top-0 bottom-0">
              {getItemsForDay(currentDate).map((item) => {
                const pos = getItemPosition(item);
                return (
                  <button
                    key={item.itemId}
                    data-booking-item
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItem(item);
                    }}
                    className={`absolute left-0 right-0 rounded-lg p-2 text-left transition-all hover:shadow-lg cursor-pointer overflow-hidden z-10 ${getStatusColor(item.status)}`}
                    style={{ top: pos.top, height: pos.height, minHeight: '28px' }}
                  >
                    <div className="text-xs font-medium">
                      {formatTime(item.startAt)} &middot;{' '}
                      {item.customerName}
                    </div>
                    <div className="text-[10px] opacity-80 truncate">
                      {item.source === 'local' ? 'Awaiting Approval' : item.serviceName} &middot;{' '}
                      {item.durationMinutes} min
                    </div>
                  </button>
                );
              })}

              {getItemsForDay(currentDate).length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-warm-400">
                    Click any time slot to book an appointment
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Side panel: detail view OR create form */}
      {showPanel && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={closePanel}
          />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto">
            <div className="p-6">

              {/* ===== CREATE BOOKING FORM ===== */}
              {createMode && !selectedItem && (
                <>
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-warm-700">New Booking</h3>
                      <p className="text-xs text-warm-500 mt-1">Book a client directly</p>
                    </div>
                    <button onClick={closePanel} aria-label="Close" className="p-2 rounded-lg hover:bg-warm-100 transition-colors">
                      <X size={18} />
                    </button>
                  </div>

                  {createSuccess ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-forest-50 border border-forest-200 rounded-xl flex items-start gap-3">
                        <Check size={18} className="text-forest-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-forest-700">{createSuccess}</p>
                          <p className="text-xs text-forest-600 mt-1">Booking created in Square.</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setCreateSuccess('');
                          setCreateForm({ serviceVariationId: '', firstName: '', lastName: '', email: '', phone: '', note: '' });
                        }}
                        className="w-full px-4 py-2.5 bg-forest-500 text-white rounded-lg text-sm font-medium hover:bg-forest-600 transition-colors"
                      >
                        Book Another
                      </button>
                      <button
                        onClick={closePanel}
                        className="w-full px-4 py-2.5 border border-warm-200 text-warm-600 rounded-lg text-sm hover:bg-warm-50 transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {createError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-start gap-2">
                          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                          {createError}
                        </div>
                      )}

                      {/* Date */}
                      <div>
                        <label className="block text-xs font-medium text-warm-600 mb-1">Date</label>
                        <input
                          type="date"
                          value={createDate}
                          onChange={(e) => {
                            setCreateDate(e.target.value);
                            setCreateTime('');
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300"
                        />
                      </div>

                      {/* Service */}
                      <div>
                        <label className="block text-xs font-medium text-warm-600 mb-1">Service</label>
                        <select
                          value={createForm.serviceVariationId}
                          onChange={(e) => {
                            setCreateForm({ ...createForm, serviceVariationId: e.target.value });
                            setCreateTime(''); // Reset time when service changes (duration affects availability)
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300"
                        >
                          <option value="">Select a service...</option>
                          {services.map((s) => (
                            <option key={s.variationId} value={s.variationId}>
                              {s.name} ({s.durationMinutes} min{s.priceCents ? ` — $${(s.priceCents / 100).toFixed(0)}` : ''})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Time */}
                      <div>
                        <label className="block text-xs font-medium text-warm-600 mb-1">Time</label>
                        {createDate && createForm.serviceVariationId ? (
                          <select
                            value={createTime}
                            onChange={(e) => setCreateTime(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300"
                          >
                            <option value="">Select a time...</option>
                            {getAvailableTimesForDate(createDate).map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        ) : (
                          <p className="text-xs text-warm-400 py-2">Select a date and service first</p>
                        )}
                      </div>

                      {/* Divider */}
                      <div className="border-t border-warm-100 pt-4">
                        <p className="text-xs font-medium text-warm-600 mb-3">Customer Info</p>
                      </div>

                      {/* Customer fields */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-warm-600 mb-1">First Name</label>
                          <input
                            type="text"
                            value={createForm.firstName}
                            onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300"
                            placeholder="First"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-warm-600 mb-1">Last Name</label>
                          <input
                            type="text"
                            value={createForm.lastName}
                            onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300"
                            placeholder="Last"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-warm-600 mb-1">Email</label>
                        <input
                          type="email"
                          value={createForm.email}
                          onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300"
                          placeholder="email@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-warm-600 mb-1">Phone</label>
                        <input
                          type="tel"
                          value={createForm.phone}
                          onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300"
                          placeholder="9515551234"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-warm-600 mb-1">Note (optional)</label>
                        <textarea
                          value={createForm.note}
                          onChange={(e) => setCreateForm({ ...createForm, note: e.target.value })}
                          maxLength={2000}
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300 resize-none"
                          placeholder="Any notes about the appointment"
                        />
                      </div>

                      {/* Submit */}
                      <button
                        onClick={handleCreateBooking}
                        disabled={createLoading || !createForm.serviceVariationId || !createTime || !createForm.firstName || !createForm.phone}
                        className="w-full px-4 py-3 bg-forest-500 text-white rounded-lg text-sm font-medium hover:bg-forest-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                      >
                        {createLoading ? (
                          <Loader2 size={16} className="animate-spin mx-auto" />
                        ) : (
                          'Book Appointment'
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* ===== BOOKING DETAIL VIEW (existing) ===== */}
              {selectedItem && (
                <>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-warm-700">
                        {selectedItem.source === 'local' ? 'Booking Request' : 'Appointment Details'}
                      </h3>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          selectedItem.status === 'ACCEPTED'
                            ? 'bg-forest-100 text-forest-700'
                            : selectedItem.status === 'AWAITING_APPROVAL'
                              ? 'bg-amber-100 text-amber-800'
                              : selectedItem.status.includes('CANCELLED')
                                ? 'bg-warm-100 text-warm-500'
                                : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {selectedItem.status === 'AWAITING_APPROVAL'
                          ? 'Awaiting Approval'
                          : selectedItem.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <button
                      onClick={closePanel}
                      aria-label="Close details"
                      className="p-2 rounded-lg hover:bg-warm-100 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Service info */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-3">
                      <Calendar size={16} className="text-forest-500 mt-0.5 shrink-0" />
                      <div className="text-sm font-medium text-warm-700">
                        {new Date(selectedItem.startAt).toLocaleDateString('en-US', {
                          weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                        })}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock size={16} className="text-forest-500 mt-0.5 shrink-0" />
                      <div className="text-sm text-warm-600">
                        {formatTime(selectedItem.startAt)} &middot; {selectedItem.durationMinutes} min
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <User size={16} className="text-forest-500 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-warm-700">{selectedItem.customerName}</div>
                        <div className="text-xs text-warm-500">{selectedItem.serviceName}</div>
                      </div>
                    </div>

                    {selectedItem.customerPhone && (
                      <div className="flex items-center gap-3">
                        <Phone size={16} className="text-forest-500 shrink-0" />
                        <a href={`tel:${selectedItem.customerPhone}`} className="text-sm text-forest-600 hover:underline">
                          {selectedItem.customerPhone}
                        </a>
                      </div>
                    )}

                    {selectedItem.customerEmail && (
                      <div className="flex items-center gap-3">
                        <Mail size={16} className="text-forest-500 shrink-0" />
                        <a href={`mailto:${selectedItem.customerEmail}`} className="text-sm text-forest-600 hover:underline">
                          {selectedItem.customerEmail}
                        </a>
                      </div>
                    )}

                    {selectedItem.customerNote && (
                      <div className="flex items-start gap-3">
                        <MessageSquare size={16} className="text-forest-500 mt-0.5 shrink-0" />
                        <div className="text-sm text-warm-600 italic">
                          &#8220;{selectedItem.customerNote}&#8221;
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions — local request: approve/decline */}
                  {selectedItem.source === 'local' && selectedItem.status === 'AWAITING_APPROVAL' && (
                    <div className="border-t border-warm-100 pt-4 space-y-3">
                      {actionError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-start gap-2">
                          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                          {actionError}
                        </div>
                      )}

                      {!cancelConfirm && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                          <p className="text-sm text-amber-800 font-medium mb-3">
                            New booking request. Approve to create the appointment in Square.
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={handleApproveRequest}
                              disabled={actionLoading}
                              className="flex-1 px-3 py-2.5 bg-forest-500 text-white rounded-lg text-sm font-medium hover:bg-forest-600 transition-colors disabled:opacity-60 min-h-[44px]"
                            >
                              {actionLoading ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Approve'}
                            </button>
                            <button
                              onClick={() => setCancelConfirm(true)}
                              disabled={actionLoading}
                              className="flex-1 px-3 py-2.5 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-60 min-h-[44px]"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      )}

                      {cancelConfirm && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                          <p className="text-sm text-red-700 mb-3">
                            Decline this booking request from <strong>{selectedItem.customerName}</strong>?
                          </p>
                          <textarea
                            value={declineReason}
                            onChange={(e) => setDeclineReason(e.target.value)}
                            placeholder="Reason (optional, not sent to customer)"
                            maxLength={500}
                            rows={2}
                            className="w-full px-3 py-2 rounded-lg border border-warm-200 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleDeclineRequest}
                              disabled={actionLoading}
                              className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-60 min-h-[44px]"
                            >
                              {actionLoading ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Yes, Decline'}
                            </button>
                            <button
                              onClick={() => { setCancelConfirm(false); setActionError(''); setDeclineReason(''); }}
                              className="flex-1 px-3 py-2 bg-white border border-warm-200 rounded-lg text-sm text-warm-600 hover:bg-warm-50 transition-colors min-h-[44px]"
                            >
                              Keep It
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions — Square booking: approve/decline for PENDING, cancel for ACCEPTED */}
                  {selectedItem.source === 'square' &&
                    (selectedItem.status === 'PENDING' || selectedItem.status === 'ACCEPTED') && (
                    <div className="border-t border-warm-100 pt-4 space-y-3">
                      {actionError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-start gap-2">
                          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                          {actionError}
                        </div>
                      )}

                      {selectedItem.status === 'PENDING' && !cancelConfirm && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                          <p className="text-sm text-amber-800 font-medium mb-3">
                            This booking is waiting for your approval.
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={handleAcceptSquare}
                              disabled={actionLoading}
                              className="flex-1 px-3 py-2.5 bg-forest-500 text-white rounded-lg text-sm font-medium hover:bg-forest-600 transition-colors disabled:opacity-60 min-h-[44px]"
                            >
                              {actionLoading ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Approve'}
                            </button>
                            <button
                              onClick={() => setCancelConfirm(true)}
                              disabled={actionLoading}
                              className="flex-1 px-3 py-2.5 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-60 min-h-[44px]"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      )}

                      {cancelConfirm ? (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                          <p className="text-sm text-red-700 mb-3">
                            {selectedItem.status === 'PENDING' ? 'Decline' : 'Cancel'} this appointment with{' '}
                            <strong>{selectedItem.customerName}</strong>?
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={selectedItem.status === 'PENDING' ? handleDeclineSquare : handleCancel}
                              disabled={actionLoading}
                              className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-60 min-h-[44px]"
                            >
                              {actionLoading ? (
                                <Loader2 size={14} className="animate-spin mx-auto" />
                              ) : (
                                selectedItem.status === 'PENDING' ? 'Yes, Decline' : 'Yes, Cancel'
                              )}
                            </button>
                            <button
                              onClick={() => { setCancelConfirm(false); setActionError(''); }}
                              className="flex-1 px-3 py-2 bg-white border border-warm-200 rounded-lg text-sm text-warm-600 hover:bg-warm-50 transition-colors min-h-[44px]"
                            >
                              Keep It
                            </button>
                          </div>
                        </div>
                      ) : selectedItem.status === 'ACCEPTED' && (
                        <button
                          onClick={() => setCancelConfirm(true)}
                          className="w-full px-4 py-2.5 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors min-h-[44px]"
                        >
                          Cancel Appointment
                        </button>
                      )}
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="border-t border-warm-100 mt-6 pt-4">
                    <div className="text-[10px] text-warm-400 space-y-1">
                      <div>
                        {selectedItem.source === 'local' ? 'Request' : 'Booking'} ID: {selectedItem.source === 'local' ? selectedItem.requestId : selectedItem.itemId}
                      </div>
                      {selectedItem.teamMemberName && (
                        <div>Staff: {selectedItem.teamMemberName}</div>
                      )}
                      <div>
                        Submitted: {new Date(selectedItem.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
