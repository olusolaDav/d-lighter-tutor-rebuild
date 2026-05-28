'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Plus, Search, Loader2, Briefcase, MapPin, Clock, Eye, MoreVertical,
  Edit, Trash2, CheckCircle, XCircle, Globe, Star, RefreshCcw, ExternalLink,
  Calendar, Users,
} from 'lucide-react';

interface Position {
  _id: string;
  title: string;
  type: 'tutor' | 'other';
  employmentType: string;
  location: { type: string; city?: string; country?: string };
  compensation: { type: string; min?: number; max?: number; currency: string };
  applicationDeadline?: string;
  isActive: boolean;
  isApproved: boolean;
  featured: boolean;
  views: number;
  createdAt: string;
}

export default function MyPositionsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPositions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '12' });
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (typeFilter !== 'all') params.set('type', typeFilter);
      const res = await fetch(`/api/admin/positions?${params}`);
      const data = await res.json();
      if (res.ok) {
        setPositions(data.data.positions || []);
        setTotal(data.data.total || 0);
      }
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, typeFilter]);

  useEffect(() => { fetchPositions(); }, [fetchPositions]);

  const togglePublish = async (pos: Position) => {
    setActionLoading(pos._id);
    try {
      const publish = !(pos.isActive && pos.isApproved);
      const res = await fetch(`/api/positions/${pos._id}/publish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publish }),
      });
      if (res.ok) {
        toast.success(publish ? 'Position published' : 'Position unpublished');
        fetchPositions();
      } else {
        const d = await res.json();
        toast.error(d.error || 'Action failed');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const deletePosition = async (id: string) => {
    if (!deletePassword.trim()) {
      setDeleteError('Password is required');
      return;
    }

    setActionLoading(id);
    try {
      const res = await fetch(`/api/positions/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success('Position deleted');
        setDeleteId(null);
        setDeletePassword('');
        setDeleteError('');
        fetchPositions();
      } else {
        if (d.error === 'Incorrect password') {
          setDeleteError('Incorrect password');
          toast.error('Incorrect password');
        } else {
          toast.error(d.error || 'Failed to delete');
        }
      }
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-10 h-10 animate-spin text-secondary" /></div>;
  }

  const totalPages = Math.ceil(total / 12);
  const isLive = (p: Position) => p.isActive && p.isApproved;

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto pb-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h1 className="text-xl font-bold">My Positions</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{total} position{total !== 1 ? 's' : ''} total</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchPositions} className="gap-1.5">
            <RefreshCcw className="w-4 h-4" /> Refresh
          </Button>
          <Link href="/super-admin/post-job">
            <Button className="bg-secondary hover:bg-secondary/90 text-white gap-1.5">
              <Plus className="w-4 h-4" /> New Position
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 glass-card">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search positions..." className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={v => { setTypeFilter(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="tutor">Tutor</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Positions List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-secondary" />
        </div>
      ) : positions.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Briefcase className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground">No positions found</p>
          <p className="text-sm text-muted-foreground">Create your first open position</p>
          <Link href="/super-admin/post-job">
            <Button className="bg-secondary text-white hover:bg-secondary/90 mt-2 gap-1.5">
              <Plus className="w-4 h-4" /> Post a Position
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {positions.map(pos => {
            const live = isLive(pos);
            const closed = pos.applicationDeadline && new Date(pos.applicationDeadline) < new Date();
            return (
              <Card key={pos._id} className="border-0 glass-card hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {pos.type === 'tutor' && (
                        <Badge className="bg-secondary/15 text-secondary border-secondary/25 gap-1 text-xs">
                          <Star className="w-3 h-3 fill-secondary" /> Tutor
                        </Badge>
                      )}
                      {live ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Live</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200 text-xs">Draft</Badge>
                      )}
                      {closed && <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">Closed</Badge>}
                      {pos.featured && <Badge className="bg-brand-orange/15 text-brand-orange border-brand-orange/25 text-xs">Featured</Badge>}
                    </div>
                    <h3 className="font-semibold text-foreground truncate">{pos.title}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{pos.location.type}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{pos.employmentType}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{pos.views} views</span>
                      {pos.applicationDeadline && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Deadline: {new Date(pos.applicationDeadline).toLocaleDateString('en-GB')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline" size="sm"
                      onClick={() => togglePublish(pos)}
                      disabled={actionLoading === pos._id}
                      className={`gap-1.5 text-xs ${live ? 'border-red-200 text-red-700 hover:bg-red-50' : 'border-green-200 text-green-700 hover:bg-green-50'}`}
                    >
                      {actionLoading === pos._id ? <Loader2 className="w-3 h-3 animate-spin" /> : live ? <XCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                      {live ? 'Unpublish' : 'Publish'}
                    </Button>

                    <a href={`/careers/${pos._id}`} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>

                    <Link href={`/super-admin/post-job/${pos._id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>

                    <Button
                      variant="ghost" size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteId(pos._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onOpenChange={v => {
        if (!v) {
          setDeleteId(null);
          setDeletePassword('');
          setDeleteError('');
        }
      }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Delete Position?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            This will permanently delete the position. Any associated applications will remain but may be orphaned.
            This action cannot be undone.
          </p>
          <div className="space-y-2 mb-4">
            <Input
              type="password"
              placeholder="Enter your password to confirm"
              value={deletePassword}
              onChange={(e) => {
                setDeletePassword(e.target.value);
                if (deleteError) setDeleteError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && deleteId && actionLoading !== deleteId) {
                  e.preventDefault();
                  void deletePosition(deleteId);
                }
              }}
              autoFocus
            />
            {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => {
              setDeleteId(null);
              setDeletePassword('');
              setDeleteError('');
            }}>Cancel</Button>
            <Button
              variant="destructive" className="flex-1"
              disabled={actionLoading === deleteId}
              onClick={() => deleteId && deletePosition(deleteId)}
            >
              {actionLoading === deleteId ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
