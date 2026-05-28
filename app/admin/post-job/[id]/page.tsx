'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import { toast } from 'sonner';
import {
  ArrowLeft, Save, Loader2, Plus, X, Briefcase, MapPin,
  Sparkles, Link as LinkIcon, BookOpen, Users, ClipboardList,
  Gift, GraduationCap, ExternalLink, CheckCircle,
} from 'lucide-react';

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

function TagInput({ items, onAdd, onRemove, placeholder, colorClass = 'bg-muted text-muted-foreground' }: { items: string[]; onAdd: (v: string) => void; onRemove: (i: number) => void; placeholder?: string; colorClass?: string }) {
  const [value, setValue] = useState('');
  const add = () => { if (!value.trim()) return; onAdd(value.trim()); setValue(''); };
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input value={value} onChange={e => setValue(e.target.value)} placeholder={placeholder}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} className="flex-1" />
        <Button type="button" variant="outline" size="icon" onClick={add} className="shrink-0"><Plus className="w-4 h-4" /></Button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {items.map((item, idx) => (
            <Badge key={idx} variant="secondary" className={`gap-1 pr-1 h-auto py-1 ${colorClass}`}>
              <span className="text-xs">{item}</span>
              <button type="button" onClick={() => onRemove(idx)} className="ml-1 rounded-sm hover:text-destructive"><X className="w-3 h-3" /></button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

const EMPLOYMENT_TYPES = [
  { value: 'full-time', label: 'Full-Time' }, { value: 'part-time', label: 'Part-Time' },
  { value: 'freelance', label: 'Freelance' }, { value: 'contract', label: 'Contract' },
];
const COMP_TYPES = [
  { value: 'hourly', label: 'Per Hour' }, { value: 'monthly', label: 'Per Month' },
  { value: 'stipend', label: 'Stipend' }, { value: 'negotiable', label: 'Negotiable' },
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

interface PositionData {
  title: string; type: 'tutor' | 'other'; description: string;
  requirements: string[]; responsibilities: string[]; subjects: string[];
  qualifications: string[]; benefits: string[];
  location: { type: 'remote' | 'onsite' | 'hybrid'; city: string; country: string };
  compensation: { type: string; min: string; max: string; currency: string };
  employmentType: string; applicationDeadline: string; assessmentLink: string; featured: boolean;
}

type ArrayField = 'requirements' | 'responsibilities' | 'subjects' | 'qualifications' | 'benefits';

export default function EditPositionPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const id = params?.id as string;

  const [data, setData] = useState<PositionData | null>(null);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`/api/admin/positions/${id}`);
        const json = await res.json();
        if (res.ok) {
          const p = json.data;
          setData({
            title: p.title || '',
            type: p.type || 'tutor',
            description: p.description || '',
            requirements: p.requirements || [],
            responsibilities: p.responsibilities || [],
            subjects: p.subjects || [],
            qualifications: p.qualifications || [],
            benefits: p.benefits || [],
            location: { type: p.location?.type || 'remote', city: p.location?.city || '', country: p.location?.country || '' },
            compensation: { type: p.compensation?.type || 'negotiable', min: p.compensation?.min?.toString() || '', max: p.compensation?.max?.toString() || '', currency: p.compensation?.currency || 'NGN' },
            employmentType: p.employmentType || 'part-time',
            applicationDeadline: p.applicationDeadline ? p.applicationDeadline.split('T')[0] : '',
            assessmentLink: p.assessmentLink || '',
            featured: p.featured || false,
          });
        } else {
          toast.error('Position not found');
          router.push('/admin/my-jobs');
        }
      } finally {
        setFetching(false);
      }
    })();
  }, [id, router]);

  if (authLoading || fetching) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-10 h-10 animate-spin text-secondary" /></div>;
  }
  if (!data) return null;

  const set = (f: keyof PositionData, v: any) => setData(p => p ? { ...p, [f]: v } : p);
  const setLoc = (f: keyof PositionData['location'], v: any) => setData(p => p ? { ...p, location: { ...p.location, [f]: v } } : p);
  const setComp = (f: keyof PositionData['compensation'], v: any) => setData(p => p ? { ...p, compensation: { ...p.compensation, [f]: v } } : p);
  const addToList = (f: ArrayField, v: string) => setData(p => p ? { ...p, [f]: [...p[f], v] } : p);
  const removeFromList = (f: ArrayField, idx: number) => setData(p => p ? { ...p, [f]: p[f].filter((_, i) => i !== idx) } : p);
  const toggleSubject = (s: string) => setData(p => p ? { ...p, subjects: p.subjects.includes(s) ? p.subjects.filter(x => x !== s) : [...p.subjects, s] } : p);

  const handleSave = async () => {
    if (!data.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const payload = {
        ...data,
        compensation: { ...data.compensation, min: data.compensation.min ? parseFloat(data.compensation.min) : undefined, max: data.compensation.max ? parseFloat(data.compensation.max) : undefined },
        applicationDeadline: data.applicationDeadline || undefined,
        assessmentLink: data.assessmentLink.trim() || undefined,
      };
      const res = await fetch(`/api/admin/positions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success('Position updated successfully');
        router.push('/admin/my-jobs');
      } else {
        const d = await res.json();
        toast.error(d.error || 'Failed to update');
      }
    } finally {
      setSaving(false);
    }
  };

  const showComp = data.compensation.type !== 'negotiable';

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-3">
        <Link href="/admin/my-jobs"><Button variant="ghost" size="sm" className="gap-1.5"><ArrowLeft className="w-4 h-4" /> Back</Button></Link>
        <Separator orientation="vertical" className="h-5" />
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold">Edit Position</h1>
          <p className="text-xs text-muted-foreground line-clamp-1">{data.title}</p>
        </div>
        <Button className="bg-secondary hover:bg-secondary/90 text-white shrink-0" onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Changes</>}
        </Button>
      </div>

      <Card className="border-0 glass-card">
        <CardContent className="p-5 flex flex-col sm:flex-row gap-5 sm:items-center">
          <div className="flex items-center gap-3 flex-1">
            <Switch checked={data.featured} onCheckedChange={v => set('featured', v)} id="featured" />
            <div>
              <Label htmlFor="featured" className="font-medium cursor-pointer">Featured</Label>
              <p className="text-xs text-muted-foreground">Highlighted on careers page</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Label className="text-sm font-medium">Type</Label>
            <Select value={data.type} onValueChange={v => set('type', v)}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tutor">★ Tutor (Primary)</SelectItem>
                <SelectItem value="other">Other Role</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 glass-card">
        <CardHeader className="pb-2"><SectionHeader icon={Briefcase} title="Basic Information" /></CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Title <span className="text-destructive">*</span></Label>
            <Input value={data.title} onChange={e => set('title', e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Employment Type</Label>
              <Select value={data.employmentType} onValueChange={v => set('employmentType', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{EMPLOYMENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Application Deadline</Label>
              <Input type="date" value={data.applicationDeadline} onChange={e => set('applicationDeadline', e.target.value)} />
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Description <span className="text-destructive">*</span></Label>
            <Textarea value={data.description} onChange={e => set('description', e.target.value)} rows={5} className="resize-y" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 glass-card border-l-4 border-l-brand-orange">
        <CardHeader className="pb-2"><SectionHeader icon={LinkIcon} title="Assessment Link" subtitle="Shown to candidates after submission" /></CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input type="url" value={data.assessmentLink} onChange={e => set('assessmentLink', e.target.value)} placeholder="https://forms.gle/..." className="flex-1" />
            {data.assessmentLink && (
              <a href={data.assessmentLink} target="_blank" rel="noopener noreferrer">
                <Button type="button" variant="outline" size="icon"><ExternalLink className="w-4 h-4" /></Button>
              </a>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 glass-card">
        <CardHeader className="pb-2"><SectionHeader icon={BookOpen} title="Subjects" /></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {COMMON_SUBJECTS.map(s => (
              <button key={s} type="button" onClick={() => toggleSubject(s)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${data.subjects.includes(s) ? 'bg-secondary text-white border-secondary' : 'bg-card text-muted-foreground border-border hover:border-secondary/50'}`}>
                {s}
              </button>
            ))}
          </div>
          <TagInput items={data.subjects.filter(s => !COMMON_SUBJECTS.includes(s))} onAdd={v => addToList('subjects', v)}
            onRemove={idx => { const c = data.subjects.filter(s => !COMMON_SUBJECTS.includes(s)); const r = c[idx]; set('subjects', data.subjects.filter(s => s !== r)); }}
            placeholder="Other subject..." colorClass="bg-secondary/10 text-secondary" />
        </CardContent>
      </Card>

      <Card className="border-0 glass-card">
        <CardHeader className="pb-2"><SectionHeader icon={ClipboardList} title="Responsibilities" /></CardHeader>
        <CardContent><TagInput items={data.responsibilities} onAdd={v => addToList('responsibilities', v)} onRemove={idx => removeFromList('responsibilities', idx)} placeholder="Add responsibility..." /></CardContent>
      </Card>

      <Card className="border-0 glass-card">
        <CardHeader className="pb-2"><SectionHeader icon={Users} title="Requirements" /></CardHeader>
        <CardContent><TagInput items={data.requirements} onAdd={v => addToList('requirements', v)} onRemove={idx => removeFromList('requirements', idx)} placeholder="Add requirement..." /></CardContent>
      </Card>

      <Card className="border-0 glass-card">
        <CardHeader className="pb-2"><SectionHeader icon={GraduationCap} title="Qualifications" /></CardHeader>
        <CardContent><TagInput items={data.qualifications} onAdd={v => addToList('qualifications', v)} onRemove={idx => removeFromList('qualifications', idx)} placeholder="Add qualification..." colorClass="bg-blue-100 text-blue-800" /></CardContent>
      </Card>

      <Card className="border-0 glass-card">
        <CardHeader className="pb-2"><SectionHeader icon={Gift} title="Benefits & Perks" /></CardHeader>
        <CardContent><TagInput items={data.benefits} onAdd={v => addToList('benefits', v)} onRemove={idx => removeFromList('benefits', idx)} placeholder="Add benefit..." colorClass="bg-green-100 text-green-800" /></CardContent>
      </Card>

      <Card className="border-0 glass-card">
        <CardHeader className="pb-2"><SectionHeader icon={MapPin} title="Location" /></CardHeader>
        <CardContent className="space-y-4">
          <Select value={data.location.type} onValueChange={v => setLoc('type', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="remote">Remote</SelectItem>
              <SelectItem value="onsite">On-site</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
          {data.location.type !== 'remote' && (
            <div className="grid grid-cols-2 gap-3">
              <Input value={data.location.city} onChange={e => setLoc('city', e.target.value)} placeholder="City" />
              <Input value={data.location.country} onChange={e => setLoc('country', e.target.value)} placeholder="Country" />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 glass-card">
        <CardHeader className="pb-2"><SectionHeader icon={Sparkles} title="Compensation" /></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Pay Type</Label>
              <Select value={data.compensation.type} onValueChange={v => setComp('type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{COMP_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Currency</Label>
              <Select value={data.compensation.currency} onValueChange={v => setComp('currency', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CURRENCY_OPTIONS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          {showComp && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Min</Label>
                <Input type="number" min="0" value={data.compensation.min} onChange={e => setComp('min', e.target.value)} />
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Max</Label>
                <Input type="number" min="0" value={data.compensation.max} onChange={e => setComp('max', e.target.value)} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Link href="/admin/my-jobs"><Button variant="outline" className="rounded-xl">Cancel</Button></Link>
        <Button className="bg-secondary hover:bg-secondary/90 text-white rounded-xl px-6" onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Changes</>}
        </Button>
      </div>
    </div>
  );
}
