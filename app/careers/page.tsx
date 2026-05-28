"use client"

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Search,
  MapPin,
  Clock,
  ChevronRight,
  ChevronLeft,
  Star,
  Users,
  Globe,
  TrendingUp,
  BookOpen,
  ArrowRight,
  Briefcase,
  Calendar,
  CheckCircle,
} from 'lucide-react';

const BECOME_TUTOR_URL = '/careers/6a16f7e798abdbb392cc216b';

interface Position {
  _id: string;
  title: string;
  type: 'tutor' | 'other';
  description: string;
  subjects: string[];
  location: {
    type: 'remote' | 'onsite' | 'hybrid';
    city?: string;
    country?: string;
  };
  compensation: {
    type: 'hourly' | 'monthly' | 'stipend' | 'negotiable';
    min?: number;
    max?: number;
    currency: string;
  };
  employmentType: string;
  applicationDeadline?: string;
  featured: boolean;
  views: number;
  createdAt: string;
}

const isDeadlinePassed = (deadline?: string) => deadline ? new Date(deadline) < new Date() : false;

const getLocationLabel = (loc: Position['location']) => {
  if (loc.type === 'remote') return 'Remote';
  if (loc.type === 'hybrid') return `Hybrid${loc.city ? ` · ${loc.city}` : ''}`;
  return [loc.city, loc.country].filter(Boolean).join(', ') || 'On-site';
};

const formatCompensation = (comp: Position['compensation']) => {
  if (comp.type === 'negotiable') return 'Competitive Pay';
  const sym: Record<string, string> = { NGN: '₦', USD: '$', GBP: '£', EUR: '€' };
  const s = sym[comp.currency] || comp.currency;
  const per = comp.type === 'hourly' ? '/hr' : comp.type === 'monthly' ? '/mo' : '';
  if (comp.min && comp.max) return `${s}${comp.min.toLocaleString()} – ${s}${comp.max.toLocaleString()}${per}`;
  if (comp.min) return `From ${s}${comp.min.toLocaleString()}${per}`;
  return 'Competitive Pay';
};

const EMPLOYMENT_LABELS: Record<string, string> = {
  'full-time': 'Full-Time',
  'part-time': 'Part-Time',
  'freelance': 'Freelance',
  'contract': 'Contract',
};

const TUTOR_PERKS = [
  { icon: TrendingUp, label: 'Competitive Pay' },
  { icon: Globe, label: 'Work Remotely' },
  { icon: Clock, label: 'Flexible Hours' },
  { icon: Users, label: 'Growing Team' },
  { icon: BookOpen, label: 'Meaningful Impact' },
  { icon: CheckCircle, label: 'Supportive Community' },
];

function PositionCard({ position }: { position: Position }) {
  const closed = isDeadlinePassed(position.applicationDeadline);
  const loc = getLocationLabel(position.location);
  const isTutor = position.type === 'tutor';

  return (
    <Link
      href={`/careers/${position._id}`}
      className={`group block rounded-2xl border bg-card hover:shadow-lg transition-all duration-200 overflow-hidden ${
        isTutor ? 'border-secondary/30 hover:border-secondary/60' : 'border-border hover:border-primary/30'
      }`}
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              {isTutor && (
                <Badge className="bg-secondary/10 text-secondary border-secondary/20 text-xs font-semibold">
                  ★ Primary Role
                </Badge>
              )}
              {position.featured && !isTutor && (
                <Badge className="bg-brand-orange/10 text-brand-orange border-brand-orange/20 text-xs">
                  Featured
                </Badge>
              )}
              {closed && (
                <Badge variant="secondary" className="text-xs bg-red-100 text-red-700 border-red-200">
                  Closed
                </Badge>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-secondary transition-colors line-clamp-1">
              {position.title}
            </h3>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-secondary group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
          {position.description}
        </p>

        {position.subjects.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {position.subjects.slice(0, 4).map(s => (
              <span key={s} className="text-xs bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 font-medium">
                {s}
              </span>
            ))}
            {position.subjects.length > 4 && (
              <span className="text-xs text-muted-foreground px-1">+{position.subjects.length - 4} more</span>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{loc}</span>
          <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{EMPLOYMENT_LABELS[position.employmentType] || position.employmentType}</span>
          <span className="flex items-center gap-1 font-medium text-foreground">{formatCompensation(position.compensation)}</span>
          {position.applicationDeadline && !closed && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Apply by {new Date(position.applicationDeadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          )}
        </div>
      </div>

      <div className={`px-5 sm:px-6 py-3 border-t flex items-center justify-between ${isTutor ? 'bg-secondary/5 border-secondary/10' : 'bg-muted/30 border-border'}`}>
        <span className="text-xs text-muted-foreground">
          Posted {new Date(position.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        <span className={`text-xs font-semibold ${isTutor ? 'text-secondary' : 'text-brand-orange'}`}>
          {closed ? 'View Details' : 'Apply Now →'}
        </span>
      </div>
    </Link>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl border bg-card p-5 sm:p-6 space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="flex gap-4 pt-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

export default function CareersPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'tutor' | 'other'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchPositions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '9' });
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (filter !== 'all') params.set('type', filter);

      const res = await fetch(`/api/positions?${params}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setPositions(data.data?.positions || []);
      setTotalPages(data.data?.pagination?.totalPages || 1);
      setTotal(data.data?.pagination?.total || 0);
    } catch {
      setPositions([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, filter]);

  useEffect(() => { fetchPositions(); }, [fetchPositions]);

  const tutorPositions = positions.filter(p => p.type === 'tutor');
  const otherPositions = positions.filter(p => p.type !== 'tutor');
  const showSections = filter === 'all' && !debouncedSearch;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary/10 via-background to-brand-orange/5 border-b">
        <div className="container mx-auto px-4 py-20 md:py-28 text-center relative z-10">
          <Badge className="mb-5 bg-secondary/15 text-secondary border-secondary/25 text-xs font-semibold px-4 py-1.5 rounded-full">
            We&apos;re Hiring
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold text-foreground leading-tight mb-5">
            Help Students{' '}
            <span className="text-secondary">Shine Brighter</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Join D-lighter Tutor and make a real difference in the lives of African children in the diaspora.
            Teach what you love, on your schedule, from anywhere in the world.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {TUTOR_PERKS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 bg-white/80 dark:bg-card border border-border rounded-full px-4 py-2 text-sm text-foreground shadow-sm">
                <Icon className="h-4 w-4 text-secondary" />
                {label}
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-secondary text-white hover:bg-secondary/90 rounded-full px-8 gap-2"
            >
              <Link href={BECOME_TUTOR_URL}>
                Become a Tutor <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8"
              onClick={() => { setFilter('other'); window.scrollTo({ top: 600, behavior: 'smooth' }); }}
            >
              Other Opportunities
            </Button>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-brand-orange/5 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* ── Positions ────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search positions, subjects..."
              className="pl-9 rounded-xl"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'tutor', 'other'] as const).map(f => (
              <button
                key={f}
                onClick={() => { setFilter(f); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  filter === f
                    ? 'bg-secondary text-white border-secondary'
                    : 'bg-card text-foreground border-border hover:border-secondary/40'
                }`}
              >
                {f === 'all' ? 'All Roles' : f === 'tutor' ? '★ Tutor' : 'Other'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : positions.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Briefcase className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No open positions right now</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              We don&apos;t have any matching openings at the moment, but we&apos;re always growing. Check back soon!
            </p>
            {(search || filter !== 'all') && (
              <Button variant="outline" onClick={() => { setSearch(''); setFilter('all'); }} className="rounded-xl">
                Clear filters
              </Button>
            )}
          </div>
        ) : showSections ? (
          <>
            {/* Tutor positions — featured prominently */}
            {tutorPositions.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-secondary fill-secondary" />
                    <h2 className="text-xl font-bold text-foreground">Become a Tutor</h2>
                  </div>
                  <Badge className="bg-secondary/10 text-secondary border-secondary/20 text-xs">
                    Primary Opening
                  </Badge>
                </div>
                <div className="grid grid-cols-1 gap-5">
                  {tutorPositions.map(p => <PositionCard key={p._id} position={p} />)}
                </div>
              </div>
            )}

            {/* Other positions */}
            {otherPositions.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="text-xl font-bold text-foreground">Other Open Positions</h2>
                  <span className="text-sm text-muted-foreground">({otherPositions.length})</span>
                </div>
                <div className="grid grid-cols-1 gap-5">
                  {otherPositions.map(p => <PositionCard key={p._id} position={p} />)}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-muted-foreground">{total} position{total !== 1 ? 's' : ''} found</p>
            </div>
            <div className="grid grid-cols-1 gap-5">
              {positions.map(p => <PositionCard key={p._id} position={p} />)}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-xl gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>
            <span className="text-sm text-muted-foreground font-medium">Page {page} of {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-xl gap-1.5"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
      <section className="bg-secondary/5 border-t border-secondary/10 py-16">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Don&apos;t see the right fit?
          </h2>
          <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
            We&apos;re always looking for passionate people. Our primary openings are for tutors —
            if you love teaching and want flexible, meaningful work, we&apos;d love to hear from you.
          </p>
          <Button
            size="lg"
            className="bg-secondary text-white hover:bg-secondary/90 rounded-full px-8 gap-2"
            onClick={() => { setFilter('tutor'); setPage(1); window.scrollTo({ top: 600, behavior: 'smooth' }); }}
          >
            View Tutor Openings <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}
