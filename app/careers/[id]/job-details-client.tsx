'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  MapPin, Clock, Calendar, ExternalLink, Loader2, ArrowLeft,
  CheckCircle, Globe, Users, Plus, Trash2, ChevronRight, GraduationCap,
  BookOpen, Star, Briefcase, Heart, Share2, Eye, X,
} from 'lucide-react';
import { toast } from 'sonner';

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface Position {
  _id: string;
  title: string;
  type: 'tutor' | 'other';
  description: string;
  requirements: string[];
  responsibilities: string[];
  subjects: string[];
  qualifications: string[];
  benefits: string[];
  location: { type: 'remote' | 'onsite' | 'hybrid'; city?: string; country?: string };
  compensation: { type: string; min?: number; max?: number; currency: string };
  employmentType: string;
  applicationDeadline?: string;
  assessmentLink?: string;
  featured: boolean;
  views: number;
  createdAt: string;
}

interface EducationEntry {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
  isOngoing: boolean;
}

interface ApplicationForm {
  personalInfo: {
    firstName: string; lastName: string; email: string;
    phone: string; city: string; country: string;
  };
  subjects: string[];
  teachingExperience: { hasExperience: boolean; yearsOfExperience: string; description: string };
  education: EducationEntry[];
  resume: {
    fileName: string;
    fileType: string;
    fileSize: number;
    url: string;
    publicId: string;
    resourceType: string;
    format?: string;
  } | null;
  availability: {
    type: 'weekdays' | 'weekends' | 'both' | 'flexible';
    schedules: Array<{
      day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
      startTime: string;
      endTime: string;
    }>;
  };
  whyJoin: string;
  additionalInfo: string;
  consent: boolean;
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

const EMPLOYMENT_LABELS: Record<string, string> = {
  'full-time': 'Full-Time', 'part-time': 'Part-Time', 'freelance': 'Freelance', 'contract': 'Contract',
};
const LOC_LABELS: Record<string, string> = { remote: 'Remote', onsite: 'On-site', hybrid: 'Hybrid' };
const CURRENCY_SYMBOLS: Record<string, string> = { NGN: '₦', USD: '$', GBP: '£', EUR: '€' };

function getLocationStr(loc: Position['location']) {
  if (loc.type === 'remote') return 'Remote (Anywhere)';
  return [loc.city, loc.country].filter(Boolean).join(', ') || LOC_LABELS[loc.type];
}

function formatComp(comp: Position['compensation']) {
  if (comp.type === 'negotiable') return 'Competitive Pay';
  const s = CURRENCY_SYMBOLS[comp.currency] || comp.currency;
  const per = comp.type === 'hourly' ? '/hr' : comp.type === 'monthly' ? '/mo' : '';
  if (comp.min && comp.max) return `${s}${comp.min.toLocaleString()} – ${s}${comp.max.toLocaleString()}${per}`;
  if (comp.min) return `From ${s}${comp.min.toLocaleString()}${per}`;
  return 'Competitive Pay';
}

const isDeadlinePassed = (d?: string) => d ? new Date(d) < new Date() : false;

const AVAILABILITY_OPTIONS = [
  { value: 'weekdays', label: 'Weekdays only' },
  { value: 'weekends', label: 'Weekends only' },
  { value: 'both', label: 'Weekdays & Weekends' },
  { value: 'flexible', label: 'Flexible / Anytime' },
 ] as const;

const WEEK_DAYS: Array<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'> = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
];

function getAllowedDaysForAvailability(type: ApplicationForm['availability']['type']) {
  if (type === 'weekdays') return WEEK_DAYS.slice(0, 5);
  if (type === 'weekends') return WEEK_DAYS.slice(5);
  if (type === 'both') return WEEK_DAYS;
  return [] as Array<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'>;
}

const emptyEducation = (): EducationEntry => ({
  institution: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '', isOngoing: false,
});

const initialForm = (): ApplicationForm => ({
  personalInfo: { firstName: '', lastName: '', email: '', phone: '', city: '', country: '' },
  subjects: [],
  teachingExperience: { hasExperience: false, yearsOfExperience: '', description: '' },
  education: [emptyEducation()],
  resume: null,
  availability: { type: 'flexible', schedules: [] },
  whyJoin: '',
  additionalInfo: '',
  consent: false,
});

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">{children}</h4>;
}

function RequiredStar() {
  return <span className="text-destructive">*</span>;
}

/* ─── AM/PM Time Picker ──────────────────────────────────────────────────── */

function TimePicker({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  // value is stored as 24-h "HH:MM" internally; display in 12-h AM/PM
  const parse = (v: string) => {
    if (!v) return { hour: '', minute: '00', period: 'AM' as 'AM' | 'PM' };
    const [h, m] = v.split(':');
    const h24 = parseInt(h || '0', 10);
    const period: 'AM' | 'PM' = h24 >= 12 ? 'PM' : 'AM';
    const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
    return { hour: String(h12), minute: m || '00', period };
  };

  const { hour, minute, period } = parse(value);

  const emit = (h: string, m: string, p: 'AM' | 'PM') => {
    if (!h) { onChange(''); return; }
    let h24 = parseInt(h, 10);
    if (p === 'PM' && h24 !== 12) h24 += 12;
    if (p === 'AM' && h24 === 12) h24 = 0;
    onChange(`${String(h24).padStart(2, '0')}:${m}`);
  };

  const base = `flex items-center gap-0.5 rounded-lg border bg-background px-2 py-1.5 transition-opacity ${
    disabled ? 'opacity-40 pointer-events-none' : ''
  }`;

  return (
    <div className={base}>
      {/* Hour */}
      <select
        value={hour}
        onChange={e => emit(e.target.value, minute, period)}
        disabled={disabled}
        className="w-9 appearance-none bg-transparent text-sm font-medium text-center focus:outline-none cursor-pointer"
      >
        <option value="">--</option>
        {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
          <option key={h} value={String(h)}>{String(h).padStart(2, '0')}</option>
        ))}
      </select>
      <span className="text-muted-foreground text-sm font-bold">:</span>
      {/* Minute — free text, 00-59 */}
      <input
        type="number"
        min={0}
        max={59}
        value={minute}
        disabled={disabled}
        onChange={e => {
          const v = Math.max(0, Math.min(59, parseInt(e.target.value || '0', 10)));
          emit(hour, String(v).padStart(2, '0'), period);
        }}
        className="w-9 appearance-none bg-transparent text-sm font-medium text-center focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      {/* AM/PM toggle */}
      <div className="flex ml-1.5 rounded-md overflow-hidden border border-border text-[11px] font-semibold shrink-0">
        <button
          type="button"
          onClick={() => emit(hour, minute, 'AM')}
          disabled={disabled}
          className={`px-1.5 py-0.5 transition-colors ${
            period === 'AM'
              ? 'bg-secondary text-white'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >AM</button>
        <button
          type="button"
          onClick={() => emit(hour, minute, 'PM')}
          disabled={disabled}
          className={`px-1.5 py-0.5 transition-colors ${
            period === 'PM'
              ? 'bg-secondary text-white'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >PM</button>
      </div>
    </div>
  );
}

/* ─── Success Modal ──────────────────────────────────────────────────────── */

function SuccessModal({
  open, positionTitle, assessmentLink, onClose,
}: {
  open: boolean; positionTitle: string; assessmentLink?: string; onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md text-center gap-0 p-0 overflow-hidden rounded-2xl">
        <div className="bg-gradient-to-b from-secondary/10 to-transparent p-8 pb-6">
          <div className="w-16 h-16 bg-secondary/15 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-9 h-9 text-secondary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Application Submitted!</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Thank you for applying for the <strong>{positionTitle}</strong> position at D-lighter Tutor.
            We&apos;ve received your application and our team will review it shortly.
          </p>
        </div>

        <div className="px-8 pb-8 space-y-5">
          {/* Next step: assessment */}
          <div className="bg-brand-orange/5 border border-brand-orange/20 rounded-xl p-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-brand-orange/15 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <ChevronRight className="w-4 h-4 text-brand-orange" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Next Step: Assessment</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The next stage of our process is an online assessment. Please complete it at your earliest
                  convenience — it helps us understand your teaching strengths.
                </p>
              </div>
            </div>
          </div>

          {assessmentLink ? (
            <a
              href={assessmentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-secondary text-white font-semibold py-3 px-6 rounded-xl hover:bg-secondary/90 transition-colors text-sm"
            >
              Take the Assessment <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <p className="text-xs text-muted-foreground bg-muted rounded-xl p-3">
              We&apos;ll send the assessment link to your email address shortly.
            </p>
          )}

          <button
            onClick={onClose}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            Back to Careers
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Application Dialog ─────────────────────────────────────────────────── */

function ApplicationDialog({
  position, onSuccess,
}: {
  position: Position;
  onSuccess: (assessmentLink?: string) => void;
}) {
  const [form, setForm] = useState<ApplicationForm>(initialForm());
  const [submitting, setSubmitting] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [subjectInput, setSubjectInput] = useState('');

  const setPI = (f: keyof ApplicationForm['personalInfo'], v: string) =>
    setForm(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, [f]: v } }));
  const setTE = (f: keyof ApplicationForm['teachingExperience'], v: any) =>
    setForm(prev => ({ ...prev, teachingExperience: { ...prev.teachingExperience, [f]: v } }));

  const subjectOptions = position.subjects || [];
  const showSubjectSection = subjectOptions.length > 0;
  const allowedDays = getAllowedDaysForAvailability(form.availability.type);

  useEffect(() => {
    if (form.availability.type === 'flexible') {
      if (form.availability.schedules.length > 0) {
        setForm(prev => ({ ...prev, availability: { ...prev.availability, schedules: [] } }));
      }
      return;
    }

    setForm(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        schedules: prev.availability.schedules.filter(s => allowedDays.includes(s.day)),
      },
    }));
  }, [form.availability.type]);

  const toggleSubject = (s: string) => {
    setForm(prev => ({
      ...prev,
      subjects: prev.subjects.includes(s) ? prev.subjects.filter(x => x !== s) : [...prev.subjects, s],
    }));
  };
  const addCustomSubject = () => {
    if (position.type === 'tutor') return;
    const v = subjectInput.trim();
    if (v && !form.subjects.includes(v)) {
      setForm(prev => ({ ...prev, subjects: [...prev.subjects, v] }));
    }
    setSubjectInput('');
  };

  const setAvailabilityType = (type: ApplicationForm['availability']['type']) => {
    setForm(prev => ({ ...prev, availability: { ...prev.availability, type } }));
  };

  const toggleAvailabilityDay = (day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday') => {
    setForm(prev => {
      const exists = prev.availability.schedules.find(s => s.day === day);
      if (exists) {
        return {
          ...prev,
          availability: {
            ...prev.availability,
            schedules: prev.availability.schedules.filter(s => s.day !== day),
          },
        };
      }
      return {
        ...prev,
        availability: {
          ...prev.availability,
          schedules: [...prev.availability.schedules, { day, startTime: '', endTime: '' }],
        },
      };
    });
  };

  const updateScheduleTime = (
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday',
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    setForm(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        schedules: prev.availability.schedules.map(s => (s.day === day ? { ...s, [field]: value } : s)),
      },
    }));
  };

  const handleResumeChange = async (file?: File) => {
    if (!file) {
      setForm(prev => ({ ...prev, resume: null }));
      return;
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Resume must be PDF, DOC, or DOCX.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Resume must not exceed 2MB.');
      return;
    }

    setUploadingResume(true);
    try {
      const payload = new FormData();
      payload.append('file', file);

      const res = await fetch('/api/uploads/resume', {
        method: 'POST',
        body: payload,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Could not upload resume.');
        return;
      }

      setForm(prev => ({
        ...prev,
        resume: data.data,
      }));
      toast.success('Resume uploaded successfully.');
    } catch {
      toast.error('Could not upload resume. Please try again.');
    } finally {
      setUploadingResume(false);
    }
  };

  const updateEdu = (idx: number, field: keyof EducationEntry, value: any) => {
    setForm(prev => {
      const edu = [...prev.education];
      edu[idx] = { ...edu[idx], [field]: value };
      if (field === 'isOngoing' && value) edu[idx].endYear = '';
      return { ...prev, education: edu };
    });
  };

  const handleSubmit = async () => {
    const { personalInfo, whyJoin, education, consent, resume } = form;
    if (!personalInfo.firstName.trim() || !personalInfo.lastName.trim()) {
      toast.error('First name and last name are required.'); return;
    }
    if (!personalInfo.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalInfo.email)) {
      toast.error('A valid email address is required.'); return;
    }
    if (!personalInfo.phone.trim()) {
      toast.error('Phone number is required.'); return;
    }
    if (!whyJoin.trim()) {
      toast.error('Please tell us why you want to join.'); return;
    }
    if (education.length === 0 || !education[0].institution.trim() || !education[0].degree.trim()) {
      toast.error('At least one education entry (institution + degree) is required.'); return;
    }
    if (!consent) {
      toast.error('Please agree to the data processing consent.'); return;
    }
    if (!resume) {
      toast.error('Please upload your resume before submitting.'); return;
    }
    if (position.type === 'tutor' && subjectOptions.length > 0 && form.subjects.length === 0) {
      toast.error('Please select at least one subject for this tutor role.'); return;
    }
    if (form.availability.type !== 'flexible') {
      if (form.availability.schedules.length === 0) {
        toast.error('Please select at least one day and add a time range.'); return;
      }
      for (const schedule of form.availability.schedules) {
        if (!schedule.startTime || !schedule.endTime) {
          toast.error(`Please add both start and end time for ${schedule.day}.`); return;
        }
        if (schedule.startTime >= schedule.endTime) {
          toast.error(`${schedule.day}: end time must be later than start time.`); return;
        }
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/positions/${position._id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalInfo,
          subjects: form.subjects,
          teachingExperience: {
            hasExperience: form.teachingExperience.hasExperience,
            yearsOfExperience: form.teachingExperience.yearsOfExperience
              ? parseInt(form.teachingExperience.yearsOfExperience)
              : undefined,
            description: form.teachingExperience.description,
          },
          education: education.map(e => ({
            ...e,
            startYear: e.startYear ? parseInt(e.startYear) : undefined,
            endYear: e.isOngoing ? undefined : (e.endYear ? parseInt(e.endYear) : undefined),
          })),
          resume,
          availability: {
            type: form.availability.type,
            schedules: form.availability.schedules,
          },
          whyJoin: form.whyJoin,
          additionalInfo: form.additionalInfo,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to submit application.'); return;
      }
      onSuccess(data.data?.assessmentLink);
    } catch {
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DialogContent
      showCloseButton={false}
      onInteractOutside={e => e.preventDefault()}
      className="w-[95vw] lg:w-[60vw] lg:min-w-[960px] max-w-[95vw] max-h-[92vh] overflow-y-auto p-0"
    >
      <div className="sticky top-0 z-20 flex justify-end border-b bg-background/95 px-4 py-2 backdrop-blur-sm">
        <DialogClose asChild>
          <button
            type="button"
            aria-label="Close"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogClose>
      </div>
      <div className="px-6 pb-6">
      <DialogHeader>
        <DialogTitle className="text-xl">Apply — {position.title}</DialogTitle>
        <p className="text-sm text-muted-foreground mt-1">
          No account needed. Fill in the form below and submit your application.
        </p>
      </DialogHeader>

      <div className="space-y-6 py-2">

        {/* Personal Info */}
        <div className="space-y-4 rounded-xl border p-4">
          <SectionLabel><Users className="w-4 h-4 text-secondary" /> Personal Information</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block">First Name <RequiredStar /></Label>
              <Input value={form.personalInfo.firstName} onChange={e => setPI('firstName', e.target.value)} placeholder="e.g. Ade" />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Last Name <RequiredStar /></Label>
              <Input value={form.personalInfo.lastName} onChange={e => setPI('lastName', e.target.value)} placeholder="e.g. Okafor" />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Email Address <RequiredStar /></Label>
              <Input type="email" value={form.personalInfo.email} onChange={e => setPI('email', e.target.value)} placeholder="you@example.com" />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Phone Number <RequiredStar /></Label>
              <Input type="tel" value={form.personalInfo.phone} onChange={e => setPI('phone', e.target.value)} placeholder="+234 800 000 0000" />
            </div>
            <div>
              <Label className="text-xs mb-1 block">City</Label>
              <Input value={form.personalInfo.city} onChange={e => setPI('city', e.target.value)} placeholder="e.g. Lagos" />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Country</Label>
              <Input value={form.personalInfo.country} onChange={e => setPI('country', e.target.value)} placeholder="e.g. Nigeria" />
            </div>
          </div>
        </div>

        {/* Resume Upload */}
        <div className="space-y-3 rounded-xl border p-4">
          <SectionLabel><Briefcase className="w-4 h-4 text-secondary" /> Resume Upload <RequiredStar /></SectionLabel>
          <div className="space-y-2">
            <Input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                disabled={uploadingResume}
              onChange={e => handleResumeChange(e.target.files?.[0])}
            />
            <p className="text-xs text-muted-foreground">Accepted formats: PDF, DOC, DOCX (max 2MB)</p>
              {uploadingResume && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading resume...
                </p>
              )}
            {form.resume && (
              <div className="flex items-center justify-between rounded-lg bg-secondary/10 border border-secondary/20 px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{form.resume.fileName}</p>
                  <p className="text-xs text-muted-foreground">{Math.round(form.resume.fileSize / 1024)} KB</p>
                </div>
                <Button type="button" size="sm" variant="ghost" onClick={() => setForm(prev => ({ ...prev, resume: null }))}>
                  Remove
                </Button>
              </div>
            )}
          </div>
        </div>

        {showSubjectSection && (
          <div className="space-y-3 rounded-xl border p-4">
            <SectionLabel><BookOpen className="w-4 h-4 text-secondary" /> Subjects You Can Teach</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {subjectOptions.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSubject(s)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    form.subjects.includes(s)
                      ? 'bg-secondary text-white border-secondary'
                      : 'bg-card text-muted-foreground border-border hover:border-secondary/50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {position.type !== 'tutor' && (
              <div className="flex gap-2 mt-2">
                <Input
                  value={subjectInput}
                  onChange={e => setSubjectInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomSubject(); } }}
                  placeholder="Other subject (type and press Enter)"
                  className="flex-1 text-sm"
                />
                <Button type="button" variant="outline" size="sm" onClick={addCustomSubject} className="shrink-0">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Teaching Experience */}
        <div className="space-y-3 rounded-xl border p-4">
          <SectionLabel><Briefcase className="w-4 h-4 text-secondary" /> Teaching Experience</SectionLabel>
          <div className="flex items-center gap-2">
            <Checkbox
              id="hasExp"
              checked={form.teachingExperience.hasExperience}
              onCheckedChange={v => setTE('hasExperience', !!v)}
            />
            <Label htmlFor="hasExp" className="text-sm cursor-pointer">I have previous teaching / tutoring experience</Label>
          </div>
          {form.teachingExperience.hasExperience && (
            <div className="space-y-3 pt-1">
              <div>
                <Label className="text-xs mb-1 block">Years of Experience</Label>
                <Input
                  type="number" min="0" max="50"
                  value={form.teachingExperience.yearsOfExperience}
                  onChange={e => setTE('yearsOfExperience', e.target.value)}
                  placeholder="e.g. 3"
                  className="max-w-[150px]"
                />
              </div>
              <div>
                <Label className="text-xs mb-1 block">Brief Description</Label>
                <Textarea
                  value={form.teachingExperience.description}
                  onChange={e => setTE('description', e.target.value)}
                  placeholder="Describe your teaching experience, types of students taught, etc."
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>

        {/* Education */}
        <div className="space-y-4 rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <SectionLabel><GraduationCap className="w-4 h-4 text-secondary" /> Education <RequiredStar /></SectionLabel>
            <Button
              type="button" variant="outline" size="sm"
              onClick={() => setForm(prev => ({ ...prev, education: [...prev.education, emptyEducation()] }))}
              className="h-7 text-xs gap-1"
            >
              <Plus className="w-3 h-3" /> Add
            </Button>
          </div>
          {form.education.map((edu, idx) => (
            <div key={idx} className="space-y-3 p-3 bg-muted/30 rounded-lg relative">
              {form.education.length > 1 && (
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, education: prev.education.filter((_, i) => i !== idx) }))}
                  className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1 block">Institution <RequiredStar /></Label>
                  <Input value={edu.institution} onChange={e => updateEdu(idx, 'institution', e.target.value)} placeholder="e.g. University of Lagos" />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Degree / Certificate <RequiredStar /></Label>
                  <Input value={edu.degree} onChange={e => updateEdu(idx, 'degree', e.target.value)} placeholder="e.g. B.Sc Education" />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Field of Study</Label>
                  <Input value={edu.fieldOfStudy} onChange={e => updateEdu(idx, 'fieldOfStudy', e.target.value)} placeholder="e.g. Mathematics" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs mb-1 block">Start Year</Label>
                    <Input type="number" value={edu.startYear} onChange={e => updateEdu(idx, 'startYear', e.target.value)} placeholder="2018" />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">End Year</Label>
                    <Input type="number" value={edu.endYear} onChange={e => updateEdu(idx, 'endYear', e.target.value)} placeholder="2022" disabled={edu.isOngoing} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`ongoing-${idx}`}
                  checked={edu.isOngoing}
                  onCheckedChange={v => updateEdu(idx, 'isOngoing', !!v)}
                />
                <Label htmlFor={`ongoing-${idx}`} className="text-xs cursor-pointer">Currently studying here</Label>
              </div>
            </div>
          ))}
        </div>

        {/* Availability */}
        <div className="space-y-3 rounded-xl border p-4">
          <SectionLabel><Clock className="w-4 h-4 text-secondary" /> Availability</SectionLabel>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <Label className="text-xs mb-1 block">When can you teach?</Label>
              <Select value={form.availability.type} onValueChange={v => setAvailabilityType(v as ApplicationForm['availability']['type'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AVAILABILITY_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {form.availability.type !== 'flexible' && (
              <div className="space-y-2 rounded-lg bg-muted/30 p-3">
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-xs">Select days &amp; set your available time range <RequiredStar /></Label>
                  <span className="text-[10px] text-muted-foreground">Uncheck a day to mark it as not available</span>
                </div>
                <div className="space-y-2">
                  {allowedDays.map(day => {
                    const schedule = form.availability.schedules.find(s => s.day === day);
                    const isAvailable = !!schedule;
                    return (
                      <div
                        key={day}
                        className={`rounded-lg border transition-all ${
                          isAvailable
                            ? 'bg-background border-border'
                            : 'bg-muted/30 border-dashed border-muted-foreground/30'
                        }`}
                      >
                        {/* Row header — always visible */}
                        <div className="flex items-center justify-between px-3 py-2">
                          <div className="flex items-center gap-2.5">
                            <Checkbox
                              id={`day-${day}`}
                              checked={isAvailable}
                              onCheckedChange={() => toggleAvailabilityDay(day)}
                            />
                            <Label
                              htmlFor={`day-${day}`}
                              className={`text-sm font-medium cursor-pointer ${
                                isAvailable ? 'text-foreground' : 'text-muted-foreground'
                              }`}
                            >
                              {day}
                            </Label>
                          </div>
                          {!isAvailable && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border">
                              Not available
                            </span>
                          )}
                        </div>

                        {/* Time pickers — only when day is selected */}
                        {isAvailable && (
                          <div className="grid grid-cols-2 gap-3 px-3 pb-3 pt-1">
                            <div>
                              <Label className="text-[10px] text-muted-foreground mb-1.5 block">From</Label>
                              <TimePicker
                                value={schedule.startTime}
                                onChange={v => updateScheduleTime(day, 'startTime', v)}
                              />
                            </div>
                            <div>
                              <Label className="text-[10px] text-muted-foreground mb-1.5 block">To</Label>
                              <TimePicker
                                value={schedule.endTime}
                                onChange={v => updateScheduleTime(day, 'endTime', v)}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Why Join */}
        <div className="space-y-3 rounded-xl border p-4">
          <SectionLabel><Heart className="w-4 h-4 text-secondary" /> Why Do You Want to Join Us? <RequiredStar /></SectionLabel>
          <Textarea
            value={form.whyJoin}
            onChange={e => setForm(prev => ({ ...prev, whyJoin: e.target.value }))}
            placeholder="Tell us about your passion for teaching, why you want to join D-lighter Tutor, and what makes you a great fit..."
            rows={5}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">{form.whyJoin.length}/1000 characters</p>
        </div>

        {/* Additional Info */}
        <div className="space-y-3 rounded-xl border p-4">
          <SectionLabel>Anything Else? (Optional)</SectionLabel>
          <Textarea
            value={form.additionalInfo}
            onChange={e => setForm(prev => ({ ...prev, additionalInfo: e.target.value }))}
            placeholder="Any other information you'd like us to know — certifications, languages you speak, special teaching methods, etc."
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Consent */}
        <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl">
          <Checkbox
            id="consent"
            checked={form.consent}
            onCheckedChange={v => setForm(prev => ({ ...prev, consent: !!v }))}
            className="mt-0.5"
          />
          <Label htmlFor="consent" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
            I consent to D-lighter Tutor processing my personal data for recruitment purposes. My data will be
            kept securely and only used in relation to this application.{' '}
            <Link href="/privacy-policy" target="_blank" className="text-secondary underline underline-offset-2">
              Privacy Policy
            </Link>
          </Label>
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={submitting || uploadingResume}
          className="w-full bg-secondary hover:bg-secondary/90 text-white rounded-xl h-12 text-base font-semibold gap-2"
        >
          {submitting ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Submitting Application...</>
          ) : (
            <>Submit Application <ChevronRight className="w-5 h-5" /></>
          )}
        </Button>
      </div>
      </div>
    </DialogContent>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────────── */

export default function PositionDetailsClient({ positionId }: { positionId?: string }) {
  const params = useParams();
  const router = useRouter();
  const id = positionId || (params?.id as string);

  const [position, setPosition] = useState<Position | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [assessmentLink, setAssessmentLink] = useState<string | undefined>();

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`/api/positions/${id}`);
        if (!res.ok) { setNotFound(true); return; }
        const data = await res.json();
        setPosition(data.data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSuccess = (link?: string) => {
    setApplyOpen(false);
    setAssessmentLink(link);
    setSuccessOpen(true);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: position?.title, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url).catch(() => {});
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-secondary mx-auto" />
          <p className="text-muted-foreground text-sm">Loading position details...</p>
        </div>
      </div>
    );
  }

  if (notFound || !position) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Briefcase className="w-7 h-7 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-bold">Position Not Found</h1>
          <p className="text-muted-foreground text-sm">
            This position is no longer available or has been filled.
          </p>
          <Link href="/careers">
            <Button className="rounded-xl bg-secondary text-white hover:bg-secondary/90 gap-2">
              <ArrowLeft className="w-4 h-4" /> View All Positions
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const closed = isDeadlinePassed(position.applicationDeadline);
  const isTutor = position.type === 'tutor';

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className={`border-b ${isTutor ? 'bg-gradient-to-r from-secondary/10 via-background to-brand-orange/5' : 'bg-muted/30'}`}>
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-2 mb-4">
              <Link href="/careers" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Careers
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="text-sm text-foreground font-medium line-clamp-1">{position.title}</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {isTutor && (
                    <Badge className="bg-secondary/15 text-secondary border-secondary/25 gap-1 text-xs font-semibold">
                      <Star className="w-3 h-3 fill-secondary" /> Primary Role
                    </Badge>
                  )}
                  {position.featured && !isTutor && (
                    <Badge className="bg-brand-orange/15 text-brand-orange border-brand-orange/25 text-xs">
                      Featured
                    </Badge>
                  )}
                  {closed ? (
                    <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-200 text-xs">
                      Applications Closed
                    </Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                      Open
                    </Badge>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mb-3">{position.title}</h1>
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-secondary" /> {getLocationStr(position.location)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-secondary" />
                    {EMPLOYMENT_LABELS[position.employmentType] || position.employmentType}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    {formatComp(position.compensation)}
                  </span>
                  {position.applicationDeadline && !closed && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-secondary" />
                      Apply by {new Date(position.applicationDeadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-xs">
                    <Eye className="w-3.5 h-3.5" /> {position.views} views
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleShare}
                  className="p-2 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                {!closed && (
                  <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-secondary hover:bg-secondary/90 text-white rounded-xl px-6 gap-2 font-semibold">
                        Apply Now <ChevronRight className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <ApplicationDialog position={position} onSuccess={handleSuccess} />
                  </Dialog>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">

              {/* Description */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">About This Role</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{position.description}</p>
                </CardContent>
              </Card>

              {/* Subjects */}
              {position.subjects.length > 0 && (
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-secondary" /> Subjects
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {position.subjects.map(s => (
                        <Badge key={s} variant="secondary" className="text-xs rounded-full px-3 py-1">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Responsibilities */}
              {position.responsibilities.length > 0 && (
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Responsibilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {position.responsibilities.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-secondary mt-0.5 shrink-0" /> {r}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Requirements */}
              {position.requirements.length > 0 && (
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {position.requirements.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 shrink-0" /> {r}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Qualifications */}
              {position.qualifications.length > 0 && (
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Qualifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {position.qualifications.map((q, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <GraduationCap className="w-4 h-4 text-secondary mt-0.5 shrink-0" /> {q}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Benefits */}
              {position.benefits.length > 0 && (
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">What We Offer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {position.benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Star className="w-4 h-4 text-brand-orange mt-0.5 shrink-0" /> {b}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Apply Card */}
              <Card className={`border-0 shadow-sm sticky top-24 ${isTutor ? 'bg-secondary/5 border border-secondary/20' : ''}`}>
                <CardContent className="p-5 space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">D-lighter Tutor</p>
                    <p className="text-sm font-semibold text-foreground">Open Position</p>
                  </div>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="w-4 h-4 text-secondary" />
                      <span>{getLocationStr(position.location)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4 text-secondary" />
                      <span>{EMPLOYMENT_LABELS[position.employmentType] || position.employmentType}</span>
                    </div>
                    {position.applicationDeadline && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4 text-secondary" />
                        <span className={closed ? 'text-red-600 font-medium' : ''}>
                          {closed ? 'Deadline passed' : `Deadline: ${new Date(position.applicationDeadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                        </span>
                      </div>
                    )}
                  </div>
                  <Separator />

                  {closed ? (
                    <div className="text-center py-2">
                      <p className="text-sm text-muted-foreground font-medium">Applications are closed</p>
                      <p className="text-xs text-muted-foreground mt-1">Check back for future openings</p>
                    </div>
                  ) : (
                    <>
                      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-secondary hover:bg-secondary/90 text-white rounded-xl gap-2 font-semibold">
                            Apply Now <ChevronRight className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <ApplicationDialog position={position} onSuccess={handleSuccess} />
                      </Dialog>
                      <p className="text-center text-xs text-muted-foreground">
                        No account needed · Takes ~5 minutes
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Assessment hint (before applying) */}
              {!closed && position.assessmentLink && (
                <Card className="border-0 shadow-sm bg-brand-orange/5 border border-brand-orange/20">
                  <CardContent className="p-4 space-y-2">
                    <p className="text-xs font-semibold text-foreground flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-brand-orange" /> After Applying
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      You will be directed to a short online assessment to help us understand your teaching strengths.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Back to careers */}
              <Link href="/careers" className="block">
                <Button variant="outline" className="w-full rounded-xl gap-2 text-sm">
                  <ArrowLeft className="w-4 h-4" /> All Open Positions
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        open={successOpen}
        positionTitle={position?.title || ''}
        assessmentLink={assessmentLink}
        onClose={() => { setSuccessOpen(false); router.push('/careers'); }}
      />
    </>
  );
}
