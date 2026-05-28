'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  ArrowLeft, Loader2, User, Mail, Phone, MapPin, BookOpen, Briefcase,
  GraduationCap, Clock, Heart, Star, Calendar, ExternalLink, Save,
  ChevronRight,
} from 'lucide-react';

interface Application {
  _id: string;
  positionId: {
    _id: string; title: string; type: string;
    assessmentLink?: string; employmentType: string;
    location: { type: string; city?: string; country?: string };
  };
  personalInfo: { firstName: string; lastName: string; email: string; phone: string; city?: string; country?: string };
  subjects: string[];
  teachingExperience: { hasExperience: boolean; yearsOfExperience?: number; description?: string };
  education: { institution: string; degree: string; fieldOfStudy?: string; startYear?: number; endYear?: number; isOngoing: boolean }[];
  resume?: {
    fileName: string;
    fileType: string;
    fileSize: number;
    url: string;
    publicId: string;
    resourceType: string;
    format?: string;
  };
  availability: {
    type: string;
    schedules: Array<{
      day: string;
      startTime: string;
      endTime: string;
    }>;
  };
  whyJoin: string;
  additionalInfo?: string;
  status: string;
  notes?: string;
  createdAt: string;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'reviewed', label: 'Reviewed', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'shortlisted', label: 'Shortlisted', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'accepted', label: 'Accepted', color: 'bg-green-100 text-green-700 border-green-200' },
];

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
      <span className="text-xs font-medium text-muted-foreground min-w-[130px] pt-0.5">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}

function formatTime(time?: string) {
  if (!time) return '';
  const [hourStr, minute] = time.split(':');
  const hour = Number(hourStr);
  if (Number.isNaN(hour)) return time;
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute} ${period}`;
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const id = params?.id as string;

  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`/api/admin/applications/${id}`);
        const data = await res.json();
        if (res.ok) {
          setApp(data.data);
          setNotes(data.data.notes || '');
          setStatus(data.data.status);
        } else {
          toast.error('Application not found');
          router.push('/super-admin/job-applications');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  const saveNotes = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (res.ok) toast.success('Notes saved');
      else toast.error('Failed to save notes');
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    setStatusSaving(true);
    try {
      const res = await fetch(`/api/admin/applications/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setStatus(newStatus);
        toast.success(`Status updated to ${newStatus}`);
      } else {
        toast.error('Failed to update status');
      }
    } finally {
      setStatusSaving(false);
    }
  };

  if (authLoading || loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-10 h-10 animate-spin text-secondary" /></div>;
  }

  if (!app) return null;

  const statusCfg = STATUS_OPTIONS.find(s => s.value === status);
  const pos = app.positionId;
  const avMap: Record<string, string> = {
    weekdays: 'Weekdays only', weekends: 'Weekends only',
    both: 'Weekdays & Weekends', flexible: 'Flexible / Anytime',
  };
  const schedules = app.availability?.schedules || [];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto pb-12">

      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href="/super-admin/job-applications">
          <Button variant="ghost" size="sm" className="gap-1.5 shrink-0"><ArrowLeft className="w-4 h-4" /> Back</Button>
        </Link>
        <Separator orientation="vertical" className="h-6 mt-1" />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {statusCfg && (
              <Badge variant="outline" className={`text-xs ${statusCfg.color}`}>{statusCfg.label}</Badge>
            )}
          </div>
          <h1 className="text-xl font-bold">
            {app.personalInfo.firstName} {app.personalInfo.lastName}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Applied {new Date(app.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-5">

          {/* Personal Info */}
          <Card className="border-0 glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4 text-secondary" /> Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <InfoRow label="Full Name" value={`${app.personalInfo.firstName} ${app.personalInfo.lastName}`} />
              <InfoRow label="Email" value={app.personalInfo.email} />
              <InfoRow label="Phone" value={app.personalInfo.phone} />
              {(app.personalInfo.city || app.personalInfo.country) && (
                <InfoRow label="Location" value={[app.personalInfo.city, app.personalInfo.country].filter(Boolean).join(', ')} />
              )}
            </CardContent>
          </Card>

          {/* Subjects */}
          {app.subjects.length > 0 && (
            <Card className="border-0 glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-secondary" /> Subjects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {app.subjects.map(s => (
                    <Badge key={s} variant="secondary" className="rounded-full text-xs px-3">{s}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Teaching Experience */}
          <Card className="border-0 glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-secondary" /> Teaching Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <InfoRow label="Has Experience" value={app.teachingExperience.hasExperience ? 'Yes' : 'No'} />
              {app.teachingExperience.hasExperience && (
                <>
                  <InfoRow label="Years of Experience" value={app.teachingExperience.yearsOfExperience ? `${app.teachingExperience.yearsOfExperience} years` : undefined} />
                  <InfoRow label="Description" value={app.teachingExperience.description} />
                </>
              )}
            </CardContent>
          </Card>

          {/* Education */}
          <Card className="border-0 glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-secondary" /> Education
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {app.education.map((edu, i) => (
                <div key={i} className={`space-y-2 ${i > 0 ? 'pt-4 border-t' : ''}`}>
                  <p className="text-sm font-semibold text-foreground">{edu.degree}{edu.fieldOfStudy ? ` — ${edu.fieldOfStudy}` : ''}</p>
                  <p className="text-sm text-muted-foreground">{edu.institution}</p>
                  <p className="text-xs text-muted-foreground">
                    {edu.startYear} – {edu.isOngoing ? 'Present' : (edu.endYear || '—')}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Availability */}
          <Card className="border-0 glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-secondary" /> Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Available" value={avMap[app.availability.type] || app.availability.type} />
              {app.availability.type !== 'flexible' && schedules.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Selected Day/Time Range</p>
                  {schedules.map((schedule, idx) => (
                    <div key={`${schedule.day}-${idx}`} className="flex items-center justify-between text-sm rounded-md border bg-muted/20 px-3 py-2">
                      <span className="font-medium text-foreground">{schedule.day}</span>
                      <span className="text-muted-foreground">
                        {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {app.availability.type !== 'flexible' && schedules.length === 0 && (
                <p className="text-xs text-muted-foreground">No day/time schedules submitted.</p>
              )}
            </CardContent>
          </Card>

          {/* Resume */}
          {app.resume?.url && (
            <Card className="border-0 glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Resume</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-md border bg-muted/20 px-3 py-2">
                  <p className="text-sm font-medium text-foreground">{app.resume.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(app.resume.fileSize / 1024)} KB · {app.resume.fileType}
                  </p>
                </div>
                <a href={app.resume.url} target="_blank" rel="noopener noreferrer" download={app.resume.fileName}>
                  <Button variant="outline" className="w-full gap-1.5 text-sm">
                    <ExternalLink className="w-4 h-4" /> Download Resume
                  </Button>
                </a>
              </CardContent>
            </Card>
          )}

          {/* Why Join */}
          <Card className="border-0 glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="w-4 h-4 text-secondary" /> Why They Want to Join
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{app.whyJoin}</p>
            </CardContent>
          </Card>

          {/* Additional Info */}
          {app.additionalInfo && (
            <Card className="border-0 glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{app.additionalInfo}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">

          {/* Status */}
          <Card className="border-0 glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Application Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={status} onValueChange={updateStatus} disabled={statusSaving}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {statusSaving && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                </p>
              )}
            </CardContent>
          </Card>

          {/* Position Info */}
          <Card className="border-0 glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Position</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                {pos.type === 'tutor' && (
                  <Badge className="bg-secondary/15 text-secondary border-secondary/25 gap-1 text-xs mb-2">
                    <Star className="w-3 h-3 fill-secondary" /> Tutor Role
                  </Badge>
                )}
                <p className="text-sm font-semibold text-foreground">{pos.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 capitalize">{pos.employmentType}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/careers/${pos._id}`} target="_blank" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                    <ExternalLink className="w-3.5 h-3.5" /> View Position
                  </Button>
                </Link>
              </div>
              {pos.assessmentLink && (
                <div>
                  <p className="text-xs font-medium text-foreground mb-1 flex items-center gap-1">
                    <ChevronRight className="w-3.5 h-3.5 text-brand-orange" /> Assessment Link
                  </p>
                  <a href={pos.assessmentLink} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-secondary underline underline-offset-2 break-all">
                    {pos.assessmentLink}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="border-0 glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Internal Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add private notes about this applicant..."
                rows={4}
                className="resize-none text-sm"
              />
              <Button size="sm" onClick={saveNotes} disabled={saving} className="w-full gap-1.5">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Notes
              </Button>
            </CardContent>
          </Card>

          <Link href="/super-admin/job-applications" className="block">
            <Button variant="outline" size="sm" className="w-full gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Back to Applications
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
