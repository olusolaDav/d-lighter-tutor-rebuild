'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  ArrowLeft, Save, Loader2, Plus, X, Briefcase, MapPin, Calendar,
  CheckCircle, Sparkles, Link as LinkIcon, BookOpen, Users, ClipboardList,
  Gift, GraduationCap, ExternalLink,
} from 'lucide-react';

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function SectionHeader({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3 pb-1">
      <div className="p-2 rounded-lg bg-secondary/10 text-secondary shrink-0"><Icon className="w-4 h-4" /></div>
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function TagInput({
  items, onAdd, onRemove, placeholder, colorClass = 'bg-muted text-muted-foreground',
}: {
  items: string[]; onAdd: (v: string) => void; onRemove: (i: number) => void;
  placeholder?: string; colorClass?: string;
}) {
  const [value, setValue] = useState('');
  const add = () => { if (!value.trim()) return; onAdd(value.trim()); setValue(''); };
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input value={value} onChange={e => setValue(e.target.value)} placeholder={placeholder}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} className="flex-1" />
        <Button type="button" variant="outline" size="icon" onClick={add} className="shrink-0">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {items.map((item, idx) => (
            <Badge key={idx} variant="secondary" className={`gap-1 pr-1 h-auto py-1 ${colorClass}`}>
              <span className="text-xs">{item}</span>
              <button type="button" onClick={() => onRemove(idx)} className="ml-1 rounded-sm hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface PositionData {
  title: string;
  type: 'tutor' | 'other';
  description: string;
  requirements: string[];
  responsibilities: string[];
  subjects: string[];
  qualifications: string[];
  benefits: string[];
  location: { type: 'remote' | 'onsite' | 'hybrid'; city: string; country: string };
  compensation: { type: 'hourly' | 'monthly' | 'stipend' | 'negotiable'; min: string; max: string; currency: string };
  employmentType: string;
  applicationDeadline: string;
  assessmentLink: string;
  featured: boolean;
}

type ArrayField = 'requirements' | 'responsibilities' | 'subjects' | 'qualifications' | 'benefits';

const EMPLOYMENT_TYPES = [
  { value: 'full-time', label: 'Full-Time' },
  { value: 'part-time', label: 'Part-Time' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'contract', label: 'Contract' },
];

const COMP_TYPES = [
  { value: 'hourly', label: 'Per Hour' },
  { value: 'monthly', label: 'Per Month' },
  { value: 'stipend', label: 'Stipend' },
  { value: 'negotiable', label: 'Negotiable' },
];

const CURRENCY_OPTIONS = [
  { value: 'NGN', label: '₦ NGN' }, { value: 'USD', label: '$ USD' },
  { value: 'GBP', label: '£ GBP' }, { value: 'EUR', label: '€ EUR' },
];

const COMMON_SUBJECTS = [
  'Mathematics', 'English Language', 'Science', 'Physics', 'Chemistry', 'Biology',
  'Further Mathematics', 'Economics', 'Government', 'Literature', 'Geography',
  'History', 'French', 'ICT / Computer Science', 'Business Studies',
];

const initial: PositionData = {
  title: '',
  type: 'tutor',
  description: '',
  requirements: [],
  responsibilities: [],
  subjects: [],
  qualifications: [],
  benefits: [],
  location: { type: 'remote', city: '', country: '' },
  compensation: { type: 'negotiable', min: '', max: '', currency: 'NGN' },
  employmentType: 'part-time',
  applicationDeadline: '',
  assessmentLink: '',
  featured: false,
};

/* ─── Page ─────────────────────────────────────────────────────────────── */

export default function PostPositionPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<PositionData>(initial);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdId, setCreatedId] = useState<string>('');

  const set = (f: keyof PositionData, v: any) => setData(p => ({ ...p, [f]: v }));
  const setLoc = (f: keyof PositionData['location'], v: any) =>
    setData(p => ({ ...p, location: { ...p.location, [f]: v } }));
  const setComp = (f: keyof PositionData['compensation'], v: any) =>
    setData(p => ({ ...p, compensation: { ...p.compensation, [f]: v } }));

  const addToList = (f: ArrayField, v: string) => {
    if (!v.trim()) return;
    setData(p => ({ ...p, [f]: [...p[f], v.trim()] }));
  };
  const removeFromList = (f: ArrayField, idx: number) =>
    setData(p => ({ ...p, [f]: p[f].filter((_, i) => i !== idx) }));

  const toggleSubject = (s: string) => {
    setData(p => ({
      ...p,
      subjects: p.subjects.includes(s) ? p.subjects.filter(x => x !== s) : [...p.subjects, s],
    }));
  };

  const handleSubmit = async () => {
    if (!data.title.trim()) { toast.error('Position title is required'); return; }
    if (!data.description.trim()) { toast.error('Description is required'); return; }

    setLoading(true);
    try {
      const payload = {
        ...data,
        compensation: {
          ...data.compensation,
          min: data.compensation.min ? parseFloat(data.compensation.min) : undefined,
          max: data.compensation.max ? parseFloat(data.compensation.max) : undefined,
        },
        applicationDeadline: data.applicationDeadline || undefined,
        assessmentLink: data.assessmentLink.trim() || undefined,
      };

      const res = await fetch('/api/admin/positions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) { toast.error(result.error || 'Failed to create position'); return; }

      setCreatedId(result.data._id);
      setShowSuccess(true);
    } catch {
      toast.error('Failed to create position');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-secondary" />
      </div>
    );
  }

  if (!user) {
    router.push('/auth/login?callbackUrl=/admin/post-job');
    return null;
  }

  const showComp = data.compensation.type !== 'negotiable';

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto pb-12">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/my-jobs">
          <Button variant="ghost" size="sm" className="gap-1.5"><ArrowLeft className="w-4 h-4" /> Back</Button>
        </Link>
        <Separator orientation="vertical" className="h-5" />
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold">Post a New Position</h1>
          <p className="text-xs text-muted-foreground">Create an open position for the careers page</p>
        </div>
        <Button className="bg-secondary hover:bg-secondary/90 text-white shrink-0" onClick={handleSubmit} disabled={loading}>
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save Position</>}
        </Button>
      </div>

      {/* Featured & Type */}
      <Card className="border-0 glass-card">
        <CardContent className="p-5 flex flex-col sm:flex-row gap-5 sm:items-center">
          <div className="flex items-center gap-3 flex-1">
            <Switch checked={data.featured} onCheckedChange={v => set('featured', v)} id="featured" />
            <div>
              <Label htmlFor="featured" className="font-medium cursor-pointer">Featured Position</Label>
              <p className="text-xs text-muted-foreground">Highlighted at the top of the careers page</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Label className="text-sm font-medium whitespace-nowrap">Position Type</Label>
            <Select value={data.type} onValueChange={v => set('type', v as any)}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tutor">★ Tutor (Primary)</SelectItem>
                <SelectItem value="other">Other Role</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card className="border-0 glass-card">
        <CardHeader className="pb-2">
          <SectionHeader icon={Briefcase} title="Basic Information" subtitle="Core details about the position" />
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Position Title <span className="text-destructive">*</span></Label>
            <Input value={data.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Primary School Tutor" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Employment Type</Label>
              <Select value={data.employmentType} onValueChange={v => set('employmentType', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Application Deadline</Label>
              <Input type="date" value={data.applicationDeadline} onChange={e => set('applicationDeadline', e.target.value)} />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-1.5 block">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              value={data.description} onChange={e => set('description', e.target.value)}
              placeholder="Describe the role, who you're looking for, and what makes this opportunity exciting..."
              rows={5} className="resize-y"
            />
          </div>
        </CardContent>
      </Card>

      {/* Assessment Link — the key new field */}
      <Card className="border-0 glass-card border-l-4 border-l-brand-orange">
        <CardHeader className="pb-2">
          <SectionHeader icon={LinkIcon} title="Assessment Link" subtitle="Candidates will see this after submitting their application" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Assessment URL</Label>
            <div className="flex gap-2">
              <Input
                type="url" value={data.assessmentLink}
                onChange={e => set('assessmentLink', e.target.value)}
                placeholder="https://forms.gle/... or https://typeform.com/..."
                className="flex-1"
              />
              {data.assessmentLink && (
                <a href={data.assessmentLink} target="_blank" rel="noopener noreferrer">
                  <Button type="button" variant="outline" size="icon"><ExternalLink className="w-4 h-4" /></Button>
                </a>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-brand-orange" />
              When a candidate submits their application, they will be shown this link to proceed to the assessment.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Subjects */}
      <Card className="border-0 glass-card">
        <CardHeader className="pb-2">
          <SectionHeader icon={BookOpen} title="Subjects" subtitle="Subjects relevant to this position (optional for non-tutor roles)" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {COMMON_SUBJECTS.map(s => (
              <button key={s} type="button" onClick={() => toggleSubject(s)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  data.subjects.includes(s)
                    ? 'bg-secondary text-white border-secondary'
                    : 'bg-card text-muted-foreground border-border hover:border-secondary/50'
                }`}>
                {s}
              </button>
            ))}
          </div>
          <TagInput
            items={data.subjects.filter(s => !COMMON_SUBJECTS.includes(s))}
            onAdd={v => addToList('subjects', v)}
            onRemove={idx => {
              const custom = data.subjects.filter(s => !COMMON_SUBJECTS.includes(s));
              const toRemove = custom[idx];
              setData(p => ({ ...p, subjects: p.subjects.filter(s => s !== toRemove) }));
            }}
            placeholder="Other subject..."
            colorClass="bg-secondary/10 text-secondary"
          />
        </CardContent>
      </Card>

      {/* Responsibilities */}
      <Card className="border-0 glass-card">
        <CardHeader className="pb-2">
          <SectionHeader icon={ClipboardList} title="Responsibilities" subtitle="What the person in this role will do" />
        </CardHeader>
        <CardContent>
          <TagInput items={data.responsibilities} onAdd={v => addToList('responsibilities', v)} onRemove={idx => removeFromList('responsibilities', idx)}
            placeholder="e.g. Deliver engaging online tutoring sessions" />
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card className="border-0 glass-card">
        <CardHeader className="pb-2">
          <SectionHeader icon={Users} title="Requirements" subtitle="What candidates must have" />
        </CardHeader>
        <CardContent>
          <TagInput items={data.requirements} onAdd={v => addToList('requirements', v)} onRemove={idx => removeFromList('requirements', idx)}
            placeholder="e.g. Minimum 2 years tutoring experience" />
        </CardContent>
      </Card>

      {/* Qualifications */}
      <Card className="border-0 glass-card">
        <CardHeader className="pb-2">
          <SectionHeader icon={GraduationCap} title="Qualifications" subtitle="Educational or professional credentials" />
        </CardHeader>
        <CardContent>
          <TagInput items={data.qualifications} onAdd={v => addToList('qualifications', v)} onRemove={idx => removeFromList('qualifications', idx)}
            placeholder="e.g. B.Sc in Education or related field" colorClass="bg-blue-100 text-blue-800" />
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card className="border-0 glass-card">
        <CardHeader className="pb-2">
          <SectionHeader icon={Gift} title="Benefits & Perks" subtitle="What we offer to successful candidates" />
        </CardHeader>
        <CardContent>
          <TagInput items={data.benefits} onAdd={v => addToList('benefits', v)} onRemove={idx => removeFromList('benefits', idx)}
            placeholder="e.g. Flexible working hours" colorClass="bg-green-100 text-green-800" />
        </CardContent>
      </Card>

      {/* Location */}
      <Card className="border-0 glass-card">
        <CardHeader className="pb-2">
          <SectionHeader icon={MapPin} title="Location" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Work Mode</Label>
            <Select value={data.location.type} onValueChange={v => setLoc('type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="onsite">On-site</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {data.location.type !== 'remote' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium mb-1.5 block">City</Label>
                <Input value={data.location.city} onChange={e => setLoc('city', e.target.value)} placeholder="e.g. Lagos" />
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Country</Label>
                <Input value={data.location.country} onChange={e => setLoc('country', e.target.value)} placeholder="e.g. Nigeria" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compensation */}
      <Card className="border-0 glass-card">
        <CardHeader className="pb-2">
          <SectionHeader icon={Sparkles} title="Compensation" subtitle="Leave negotiable if you prefer not to disclose a range" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Pay Type</Label>
              <Select value={data.compensation.type} onValueChange={v => setComp('type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COMP_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Currency</Label>
              <Select value={data.compensation.currency} onValueChange={v => setComp('currency', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCY_OPTIONS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          {showComp && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Minimum</Label>
                <Input type="number" min="0" value={data.compensation.min} onChange={e => setComp('min', e.target.value)} placeholder="e.g. 5000" />
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Maximum</Label>
                <Input type="number" min="0" value={data.compensation.max} onChange={e => setComp('max', e.target.value)} placeholder="e.g. 15000" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Link href="/admin/my-jobs"><Button variant="outline" className="rounded-xl">Cancel</Button></Link>
        <Button className="bg-secondary hover:bg-secondary/90 text-white rounded-xl px-6" onClick={handleSubmit} disabled={loading}>
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save Position</>}
        </Button>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader>
            <div className="w-14 h-14 bg-secondary/15 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8 text-secondary" />
            </div>
            <DialogTitle className="text-xl">Position Created!</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mt-2 mb-5">
            Your position has been saved as a <strong>draft</strong>. Go to <em>My Positions</em> to publish it
            and make it visible on the careers page.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" className="rounded-xl" onClick={() => router.push('/admin/my-jobs')}>
              My Positions
            </Button>
            <Button className="bg-secondary text-white hover:bg-secondary/90 rounded-xl gap-1.5" onClick={() => router.push(`/careers/${createdId}`)}>
              Preview <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
