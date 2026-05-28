'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Search, Loader2, Users, Eye, ChevronRight, RefreshCcw,
  CheckCircle, XCircle, Clock, Star, FileText, TrendingUp, Trash2, Download,
} from 'lucide-react';

interface Application {
  _id: string;
  positionId: { _id: string; title: string; type: string } | string;
  personalInfo: { firstName: string; lastName: string; email: string; phone: string; city?: string; country?: string };
  subjects: string[];
  teachingExperience?: { hasExperience: boolean; yearsOfExperience?: number; description?: string };
  education?: Array<{ institution: string; degree: string; fieldOfStudy?: string; startYear?: number; endYear?: number; isOngoing: boolean }>;
  resume?: { fileName: string; fileType: string; fileSize: number; url: string; publicId: string };
  availability?: { type: string; schedules?: Array<{ day: string; startTime: string; endTime: string }> };
  whyJoin?: string;
  additionalInfo?: string;
  notes?: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
  createdAt: string;
}

interface Stats {
  total: number; pending: number; reviewed: number;
  shortlisted: number; rejected: number; accepted: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  reviewed: { label: 'Reviewed', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  shortlisted: { label: 'Shortlisted', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 border-red-200' },
  accepted: { label: 'Accepted', color: 'bg-green-100 text-green-700 border-green-200' },
};

export default function ApplicationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [positions, setPositions] = useState<{ _id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Application | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [exporting, setExporting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (positionFilter !== 'all') params.set('positionId', positionFilter);
      const res = await fetch(`/api/admin/applications?${params}`);
      const data = await res.json();
      if (res.ok) {
        setApplications(data.data.applications || []);
        setStats(data.data.stats || null);
        setPositions(data.data.positions || []);
        setTotal(data.data.total || 0);
      }
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, positionFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const deleteApplication = async () => {
    if (!deleteTarget) return;
    if (!deletePassword.trim()) {
      setDeleteError('Password is required');
      return;
    }

    setDeletingId(deleteTarget._id);
    setDeleteError('');
    try {
      const res = await fetch(`/api/admin/applications/${deleteTarget._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success('Application deleted');
        setApplications(prev => prev.filter(a => a._id !== deleteTarget._id));
        setTotal(prev => prev - 1);
        setDeleteTarget(null);
        setDeletePassword('');
      } else {
        if (data?.error === 'Incorrect password') {
          setDeleteError('Incorrect password');
          toast.error('Incorrect password');
        } else {
          toast.error(data?.error || 'Failed to delete application');
        }
      }
    } finally {
      setDeletingId(null);
    }
  };

  const exportToExcel = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({ page: '1', limit: '10000' });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (positionFilter !== 'all') params.set('positionId', positionFilter);
      const res = await fetch(`/api/admin/applications?${params}`);
      const data = await res.json();
      const allApps: Application[] = data.data?.applications || [];

      const XLSX = await import('xlsx');

      // Group by position title
      const groups: Record<string, Application[]> = {};
      for (const app of allApps) {
        const pos = typeof app.positionId === 'object' ? app.positionId : null;
        const key = pos?.title || 'Unknown Position';
        if (!groups[key]) groups[key] = [];
        groups[key].push(app);
      }

      const wb = XLSX.utils.book_new();

      const fmtTime = (t: string) => {
        if (!t) return '';
        const [h, m] = t.split(':').map(Number);
        const period = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 === 0 ? 12 : h % 12;
        return `${h12}:${String(m).padStart(2, '0')} ${period}`;
      };

      // Sheet per position group
      for (const [posTitle, apps] of Object.entries(groups)) {
        const rows = apps.map(app => {
          const exp = app.teachingExperience;
          const edus = (app.education || []).map(e =>
            `${e.degree}${e.fieldOfStudy ? ' (' + e.fieldOfStudy + ')' : ''} @ ${e.institution} ${e.startYear || ''}–${e.isOngoing ? 'Present' : (e.endYear || '')}`.trim()
          ).join(' | ');
          const schedules = (app.availability?.schedules || []).map(s =>
            `${s.day} ${fmtTime(s.startTime)}–${fmtTime(s.endTime)}`
          ).join(', ');
          return {
            'First Name': app.personalInfo.firstName,
            'Last Name': app.personalInfo.lastName,
            'Email': app.personalInfo.email,
            'Phone': app.personalInfo.phone,
            'City': app.personalInfo.city || '',
            'Country': app.personalInfo.country || '',
            'Position': posTitle,
            'Status': app.status,
            'Subjects': app.subjects.join(', '),
            'Has Teaching Experience': exp?.hasExperience ? 'Yes' : 'No',
            'Years of Experience': exp?.hasExperience ? (exp.yearsOfExperience ?? '') : '',
            'Experience Description': exp?.hasExperience ? (exp.description || '') : '',
            'Education': edus,
            'Availability Type': app.availability?.type || '',
            'Schedule': schedules,
            'Why Join': app.whyJoin || '',
            'Additional Info': app.additionalInfo || '',
            'Resume Link': app.resume?.url || '',
            'Internal Notes': app.notes || '',
            'Applied Date': new Date(app.createdAt).toLocaleDateString('en-GB'),
          };
        });
        const ws = XLSX.utils.json_to_sheet(rows);
        // Sanitize sheet name (Excel limit: 31 chars, no special chars)
        const sheetName = posTitle.replace(/[:\\/?*\[\]]/g, '').substring(0, 31);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      }

      if (Object.keys(groups).length === 0) {
        toast.error('No applications to export');
        return;
      }

      const dateStr = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `applications-${dateStr}.xlsx`);
      toast.success('Export downloaded');
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-10 h-10 animate-spin text-secondary" /></div>;
  }

  const totalPages = Math.ceil(total / 15);

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto pb-12">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Applications</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{total} total application{total !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportToExcel} disabled={exporting} className="gap-1.5">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export Excel
          </Button>
          <Button variant="outline" size="sm" onClick={fetchData} className="gap-1.5">
            <RefreshCcw className="w-4 h-4" /> Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => { setStatusFilter(key === statusFilter ? 'all' : key); setPage(1); }}
              className={`p-3 rounded-xl border text-left transition-all hover:shadow-sm ${
                statusFilter === key ? 'border-secondary shadow-sm bg-secondary/5' : 'border-border bg-card'
              }`}
            >
              <p className={`text-lg font-bold ${statusFilter === key ? 'text-secondary' : 'text-foreground'}`}>
                {(stats as any)[key] ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">{cfg.label}</p>
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      <Card className="border-0 glass-card">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name or email..." className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={positionFilter} onValueChange={v => { setPositionFilter(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Position" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              {positions.map(p => <SelectItem key={p._id} value={p._id}>{p.title}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-secondary" />
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">No applications found</p>
          <p className="text-sm text-muted-foreground">Applications will appear here once candidates apply</p>
        </div>
      ) : (
        <div className="space-y-2">
          {applications.map(app => {
            const cfg = STATUS_CONFIG[app.status];
            const pos = typeof app.positionId === 'object' ? app.positionId : null;
            return (
              <div key={app._id} className="relative group">
                <Link href={`/admin/job-applications/${app._id}`} className="block">
                  <Card className="border-0 glass-card hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className={`text-xs ${cfg.color}`}>{cfg.label}</Badge>
                          {pos?.type === 'tutor' && (
                            <Badge className="bg-secondary/15 text-secondary border-secondary/25 gap-1 text-xs">
                              <Star className="w-3 h-3 fill-secondary" /> Tutor
                            </Badge>
                          )}
                        </div>
                        <p className="font-semibold text-foreground">
                          {app.personalInfo.firstName} {app.personalInfo.lastName}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                          <span>{app.personalInfo.email}</span>
                          {pos && <span className="truncate max-w-[180px]">Position: {pos.title}</span>}
                          {app.subjects.length > 0 && (
                            <span className="truncate max-w-[200px]">Subjects: {app.subjects.slice(0, 3).join(', ')}{app.subjects.length > 3 ? '…' : ''}</span>
                          )}
                          <span>{new Date(app.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                    </CardContent>
                  </Card>
                </Link>
                <div className="absolute right-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDeleteTarget(app);
                      setDeletePassword('');
                      setDeleteError('');
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            setDeletePassword('');
            setDeleteError('');
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Application Deletion</DialogTitle>
            <DialogDescription>
              This action is permanent. Enter your admin password to delete
              {deleteTarget ? ` ${deleteTarget.personalInfo.firstName} ${deleteTarget.personalInfo.lastName}'s application.` : ' this application.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Enter your password"
              value={deletePassword}
              onChange={(e) => {
                setDeletePassword(e.target.value);
                if (deleteError) setDeleteError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !deletingId) {
                  e.preventDefault();
                  void deleteApplication();
                }
              }}
              autoFocus
            />
            {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteTarget(null);
                setDeletePassword('');
                setDeleteError('');
              }}
              disabled={!!deletingId}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => void deleteApplication()} disabled={!!deletingId}>
              {deletingId ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete Application'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
