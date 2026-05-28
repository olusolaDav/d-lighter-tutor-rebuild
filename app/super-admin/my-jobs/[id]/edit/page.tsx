'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  X,
  Briefcase,
  DollarSign,
  MapPin,
  Calendar,
  User,
  Wand2,
  Sparkles,
  Building,
  GraduationCap,
  ClipboardList,
  Gift,
  Code,
  Globe,
  Phone,
  Mail,
  Settings,
  Info,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface EmployerInfo {
  isDirectEmployer: boolean;
  name?: string;
  positionInCompany?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactPhoneCountry?: string;
  email?: string;
  phoneNumber?: string;
  phoneCountry?: string;
}

interface ApplicationMethod {
  type: 'platform' | 'email' | 'external' | 'instructions';
  email?: string;
  externalUrls?: string[];
  instructions?: string[];
  specificQuestions?: string[];
}

interface JobData {
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills: string[];
  benefits: string[];
  department: string;
  company: { name: string; website?: string; description?: string; logo?: string };
  employerInfo: EmployerInfo;
  applicationMethod: ApplicationMethod;
  location: { type: 'remote' | 'onsite' | 'hybrid'; city?: string; country?: string };
  salary: { min: number; max: number; currency: string; period: string };
  jobType: string;
  internshipType?: 'paid' | 'unpaid' | '';
  experience: string;
  applicationDeadline?: string;
  isActive: boolean;
  featured: boolean;
}

const CURRENCY_OPTIONS = [
  { value: 'NGN', label: '₦ NGN' },
  { value: 'USD', label: '$ USD' },
  { value: 'GBP', label: '£ GBP' },
  { value: 'EUR', label: '€ EUR' },
];

const SALARY_PERIOD_OPTIONS = [
  { value: 'hourly', label: 'Per Hour' },
  { value: 'monthly', label: 'Per Month' },
  { value: 'yearly', label: 'Per Year' },
];

const EXPERIENCE_LEVELS = [
  { value: 'intern', label: 'Intern (0–1 yrs)' },
  { value: 'trainee', label: 'Trainee' },
  { value: 'junior', label: 'Junior (1–2 yrs)' },
  { value: 'mid', label: 'Mid-Level (2–5 yrs)' },
  { value: 'senior', label: 'Senior (5–8 yrs)' },
  { value: 'lead', label: 'Lead / Tech Lead' },
  { value: 'principal', label: 'Principal Engineer' },
  { value: 'management', label: 'Management' },
  { value: 'executive', label: 'Executive (C-Level / VP)' },
];

const EMPLOYMENT_TYPES = [
  { value: 'full-time', label: 'Full-Time' },
  { value: 'part-time', label: 'Part-Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'internship', label: 'Internship' },
  { value: 'temporary', label: 'Temporary' },
];

type ArrayField = 'requirements' | 'responsibilities' | 'skills' | 'benefits';

function SectionHeader({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3 pb-1">
      <div className="p-2 rounded-lg bg-brand-orange/10 text-brand-orange shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function TagInput({
  items,
  onAdd,
  onRemove,
  placeholder,
  colorClass = 'bg-muted text-muted-foreground',
}: {
  items: string[];
  onAdd: (value: string) => void;
  onRemove: (idx: number) => void;
  placeholder?: string;
  colorClass?: string;
}) {
  const [value, setValue] = useState('');
  const add = () => {
    if (!value.trim()) return;
    onAdd(value.trim());
    setValue('');
  };
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={placeholder}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          className="flex-1"
        />
        <Button type="button" variant="outline" size="icon" onClick={add} className="shrink-0">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {items.map((item, idx) => (
            <Badge key={idx} variant="secondary" className={`gap-1 pr-1 h-auto py-1 ${colorClass}`}>
              <span className="text-xs">{item}</span>
              <button
                type="button"
                onClick={() => onRemove(idx)}
                className="ml-1 rounded-sm hover:text-destructive transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [jobData, setJobData] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiButton, setShowAiButton] = useState(false);

  const fetchJob = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/jobs/${jobId}`);
      if (!res.ok) throw new Error('Job not found');
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      const j = data.job;
      setJobData({
        title: j.title || '',
        description: j.description || '',
        requirements: j.requirements || [],
        responsibilities: j.responsibilities || [],
        skills: j.skills || [],
        benefits: j.benefits || [],
        department: j.department || '',
        company: {
          name: j.company?.name || '',
          website: j.company?.website || '',
          description: j.company?.description || '',
          logo: j.company?.logo || '',
        },
        employerInfo: {
          isDirectEmployer: j.employerInfo?.isDirectEmployer ?? true,
          name: j.employerInfo?.name || '',
          positionInCompany: j.employerInfo?.positionInCompany || '',
          contactName: j.employerInfo?.contactName || '',
          contactEmail: j.employerInfo?.contactEmail || '',
          contactPhone: j.employerInfo?.contactPhone || '',
          contactPhoneCountry: j.employerInfo?.contactPhoneCountry || 'NG',
          email: j.employerInfo?.email || '',
          phoneNumber: j.employerInfo?.phoneNumber || '',
          phoneCountry: j.employerInfo?.phoneCountry || 'NG',
        },
        applicationMethod: {
          type: j.applicationMethod?.type || 'platform',
          email: j.applicationMethod?.email || '',
          externalUrls: j.applicationMethod?.externalUrls?.length ? j.applicationMethod.externalUrls : [''],
          instructions: j.applicationMethod?.instructions?.length ? j.applicationMethod.instructions : [''],
          specificQuestions: j.applicationMethod?.specificQuestions || [],
        },
        location: {
          type: j.location?.type || 'remote',
          city: j.location?.city || '',
          country: j.location?.country || '',
        },
        salary: {
          min: j.salary?.min || 0,
          max: j.salary?.max || 0,
          currency: j.salary?.currency || 'USD',
          period: j.salary?.period || 'yearly',
        },
        jobType: j.jobType || 'full-time',
        internshipType: j.internshipType || '',
        experience: j.experience || 'mid',
        applicationDeadline: j.applicationDeadline
          ? new Date(j.applicationDeadline).toISOString().slice(0, 10)
          : '',
        isActive: j.isActive !== false,
        featured: j.featured || false,
      });
      if (j.title?.trim().length >= 3) setShowAiButton(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load job');
      router.push('/admin/my-jobs');
    } finally {
      setLoading(false);
    }
  }, [jobId, router]);

  useEffect(() => { fetchJob(); }, [fetchJob]);

  const set = (field: keyof JobData, value: any) =>
    setJobData(prev => prev ? { ...prev, [field]: value } : prev);

  const setNested = (parent: 'company' | 'location' | 'salary', field: string, value: any) =>
    setJobData(prev => prev ? { ...prev, [parent]: { ...prev[parent], [field]: value } } : prev);

  const setEmployerInfo = (field: keyof EmployerInfo, value: any) =>
    setJobData(prev => prev ? { ...prev, employerInfo: { ...prev.employerInfo, [field]: value } } : prev);

  const setAppMethod = (field: keyof ApplicationMethod, value: any) =>
    setJobData(prev => prev ? { ...prev, applicationMethod: { ...prev.applicationMethod, [field]: value } } : prev);

  const addToList = (field: ArrayField, value: string) => {
    if (!value.trim()) return;
    setJobData(prev => prev ? { ...prev, [field]: [...prev[field], value.trim()] } : prev);
  };

  const removeFromList = (field: ArrayField, idx: number) =>
    setJobData(prev => prev ? { ...prev, [field]: prev[field].filter((_, i) => i !== idx) } : prev);

  const handleTitleChange = (value: string) => {
    set('title', value);
    setShowAiButton(value.trim().length >= 3);
  };

  const handleAiAutoFill = async () => {
    if (!jobData?.title?.trim()) {
      toast.error('Please enter a job title first');
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/generate-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: jobData.title,
          jobType: jobData.jobType,
          experience: jobData.experience,
          company: jobData.company.name || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || 'Failed to generate job details');
        return;
      }
      const { description, responsibilities, requirements, skills, benefits, department, companyDescription, isAlotRole: aiIsAlotRole, screeningQuestions, suggestedSalary } = data.data;
      const ALOT_DEFAULTS = {
        companyName: 'Alot Academy Ltd.',
        companyWebsite: 'https://alotacademy.com',
        employerName: 'Hiring Team',
        employerEmail: 'hr@alotdigitalagency.com',
        employerPhone: '+2348032158383',
        employerPosition: 'HR Manager',
      };
      setJobData(prev => {
        if (!prev) return prev;
        const updated: JobData = {
          ...prev,
          description: description || prev.description,
          responsibilities: responsibilities?.length ? responsibilities : prev.responsibilities,
          requirements: requirements?.length ? requirements : prev.requirements,
          skills: skills?.length ? skills : prev.skills,
          benefits: benefits?.length ? benefits : prev.benefits,
          department: department || prev.department,
          company: {
            ...prev.company,
            ...(aiIsAlotRole && !prev.company.name.trim() ? { name: ALOT_DEFAULTS.companyName } : {}),
            ...(aiIsAlotRole && !prev.company.website?.trim() ? { website: ALOT_DEFAULTS.companyWebsite } : {}),
            description: companyDescription || prev.company.description || '',
          },
          employerInfo: {
            ...prev.employerInfo,
            isDirectEmployer: true,
            ...(aiIsAlotRole && !prev.employerInfo.name?.trim() ? { name: ALOT_DEFAULTS.employerName } : {}),
            ...(aiIsAlotRole && !prev.employerInfo.email?.trim() ? { email: ALOT_DEFAULTS.employerEmail } : {}),
            ...(aiIsAlotRole && !prev.employerInfo.phoneNumber?.trim() ? { phoneNumber: ALOT_DEFAULTS.employerPhone } : {}),
            ...(aiIsAlotRole && !prev.employerInfo.positionInCompany?.trim() ? { positionInCompany: ALOT_DEFAULTS.employerPosition } : {}),
          },
          applicationMethod: {
            ...prev.applicationMethod,
            specificQuestions: screeningQuestions?.length
              ? screeningQuestions
              : prev.applicationMethod.specificQuestions,
          },
        };
        if (suggestedSalary && prev.jobType !== 'internship') {
          updated.salary = {
            min: suggestedSalary.min || prev.salary.min,
            max: suggestedSalary.max || prev.salary.max,
            currency: suggestedSalary.currency || prev.salary.currency,
            period: suggestedSalary.period || prev.salary.period,
          };
        } else if (suggestedSalary && prev.jobType === 'internship' && prev.internshipType === 'paid') {
          updated.salary = {
            min: suggestedSalary.min || prev.salary.min,
            max: suggestedSalary.max || prev.salary.max,
            currency: suggestedSalary.currency || prev.salary.currency,
            period: 'stipend',
          };
        }
        return updated;
      });
      toast.success('Job details generated! Review and edit as needed.');
    } catch {
      toast.error('Failed to connect to AI. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async () => {
    if (!jobData) return;
    if (!jobData.title.trim()) { toast.error('Job title is required'); return; }
    if (!jobData.description.trim()) { toast.error('Job description is required'); return; }
    if (!jobData.company.name.trim()) { toast.error('Company name is required'); return; }
    if (jobData.jobType === 'internship' && !jobData.internshipType) {
      toast.error('Please select whether this is a paid or unpaid internship');
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        ...jobData,
        applicationDeadline: jobData.applicationDeadline ? new Date(jobData.applicationDeadline) : undefined,
      };
      if (jobData.jobType === 'internship' && jobData.internshipType === 'unpaid') {
        payload.salary = { min: 0, max: 0, currency: 'USD', period: 'yearly' };
      }
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Job updated successfully');
        router.push('/admin/my-jobs');
      } else {
        toast.error(data.error || 'Failed to update job');
      }
    } catch {
      toast.error('Failed to update job');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-brand-orange mx-auto" />
          <p className="text-muted-foreground text-sm">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!jobData) return null;

  const isInternship = jobData.jobType === 'internship';
  const isPaidInternship = isInternship && jobData.internshipType === 'paid';
  const isUnpaidInternship = isInternship && jobData.internshipType === 'unpaid';
  const showSalary = !isInternship || isPaidInternship;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto pb-12">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/my-jobs">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </Link>
        <Separator orientation="vertical" className="h-5" />
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{jobData.title || 'Edit Job'}</h1>
          <p className="text-xs text-muted-foreground">Update job posting details</p>
        </div>
        <Button className="btn-gradient-primary text-white shrink-0" onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
        </Button>
      </div>

      {/* Visibility Toggles */}
      <Card className="border-0 glass-card">
        <CardContent className="p-5">
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <Switch checked={jobData.isActive} onCheckedChange={v => set('isActive', v)} id="isActive" />
              <div>
                <Label htmlFor="isActive" className="font-medium cursor-pointer">Active</Label>
                <p className="text-xs text-muted-foreground">Visible to candidates</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={jobData.featured} onCheckedChange={v => set('featured', v)} id="featured" />
              <div>
                <Label htmlFor="featured" className="font-medium cursor-pointer">Featured</Label>
                <p className="text-xs text-muted-foreground">Highlighted in listings</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card className="border-0 glass-card">
        <CardHeader className="pb-2">
          <SectionHeader icon={Briefcase} title="Basic Information" subtitle="Core details about the position" />
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Title + AI */}
          <div>
            <Label className="text-sm font-medium mb-1.5 block">
              Job Title <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                value={jobData.title}
                onChange={e => handleTitleChange(e.target.value)}
                placeholder="e.g. Senior Frontend Developer"
                className="flex-1"
              />
              {showAiButton && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAiAutoFill}
                  disabled={aiLoading}
                  className="shrink-0 gap-2 border-brand-orange/40 text-brand-orange hover:bg-brand-orange/10 hover:border-brand-orange transition-colors"
                  title="Auto-fill all fields with AI"
                >
                  {aiLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> AI Fill</>
                  )}
                </Button>
              )}
            </div>
            {showAiButton && !aiLoading && (
              <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                <Wand2 className="w-3 h-3" />
                Click "AI Fill" to auto-generate all form fields from your job title
              </p>
            )}
          </div>

          {/* Job Type + Internship type + Experience + Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium mb-1.5 block">Job Type <span className="text-destructive">*</span></Label>
              <Select value={jobData.jobType} onValueChange={v => {
                set('jobType', v);
                if (v !== 'internship') set('internshipType', '');
                if (v === 'internship') setNested('salary', 'period', 'stipend');
                else if (jobData.salary.period === 'stipend') setNested('salary', 'period', 'yearly');
              }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isInternship && (
              <div>
                <Label className="text-sm font-medium mb-1.5 block">
                  Internship Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={jobData.internshipType || ''}
                  onValueChange={v => {
                    set('internshipType', v);
                    if (v === 'paid') setNested('salary', 'period', 'stipend');
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid Internship</SelectItem>
                    <SelectItem value="unpaid">Unpaid Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label className="text-sm font-medium mb-1.5 block">Experience Level <span className="text-destructive">*</span></Label>
              <Select value={jobData.experience} onValueChange={v => set('experience', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_LEVELS.map(l => (
                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-1.5 block">Department</Label>
              <Input
                value={jobData.department}
                onChange={e => set('department', e.target.value)}
                placeholder="e.g. Engineering"
              />
            </div>
          </div>

          {/* Internship info note */}
          {isInternship && jobData.internshipType && (
            <div className={`rounded-lg p-3 flex gap-2 text-sm ${
              isPaidInternship
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400'
            }`}>
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                {isPaidInternship
                  ? 'Paid internship — compensation shown as monthly stipend, not salary.'
                  : 'Unpaid internship — no monetary compensation. Highlight learning and development in benefits.'}
              </span>
            </div>
          )}

          {/* Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Application Deadline
              </Label>
              <DatePicker
                value={jobData.applicationDeadline || ''}
                onChange={(val) => set('applicationDeadline', val)}
                min={new Date().toISOString().slice(0, 10)}
                placeholder="Select deadline"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="text-sm font-medium mb-1.5 block">
              Job Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              value={jobData.description}
              onChange={e => set('description', e.target.value)}
              rows={7}
              placeholder="Provide a comprehensive description of the role, team environment, and what makes this opportunity unique..."
              className="resize-y"
            />
            <p className="text-xs text-muted-foreground mt-1">{jobData.description.length} characters</p>
          </div>
        </CardContent>
      </Card>

      {/* Company Information */}
      <Card className="border-0 glass-card">
        <CardHeader className="pb-2">
          <SectionHeader icon={Building} title="Company Information" subtitle="Details about the hiring company" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-1.5 block">
                Company Name <span className="text-destructive">*</span>
              </Label>
              <Input
                value={jobData.company.name}
                onChange={e => setNested('company', 'name', e.target.value)}
                placeholder="e.g. ALOT Digital Agency"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> Company Website
              </Label>
              <Input
                value={jobData.company.website || ''}
                onChange={e => setNested('company', 'website', e.target.value)}
                placeholder="https://company.com"
              />
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Company Description</Label>
            <Textarea
              value={jobData.company.description || ''}
              onChange={e => setNested('company', 'description', e.target.value)}
              rows={3}
              placeholder="Brief overview of the company, its mission, and culture..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Employer Information */}
      <Card className="border-0 glass-card">
        <CardHeader className="pb-2">
          <SectionHeader icon={User} title="Employer Information" subtitle="Your contact details as the hiring party" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Checkbox
              id="isDirectEmployer"
              checked={jobData.employerInfo.isDirectEmployer}
              onCheckedChange={v => setEmployerInfo('isDirectEmployer', v as boolean)}
            />
            <Label htmlFor="isDirectEmployer" className="cursor-pointer">
              I am the direct employer (company owner / HR)
            </Label>
          </div>
          {jobData.employerInfo.isDirectEmployer ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm mb-1.5 block">Your Full Name</Label>
                <Input value={jobData.employerInfo.name || ''} onChange={e => setEmployerInfo('name', e.target.value)} placeholder="e.g. John Doe" />
              </div>
              <div>
                <Label className="text-sm mb-1.5 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Your Email Address</Label>
                <Input type="email" value={jobData.employerInfo.email || ''} onChange={e => setEmployerInfo('email', e.target.value)} placeholder="you@company.com" />
              </div>
              <div>
                <Label className="text-sm mb-1.5 block">Your Position / Title</Label>
                <Input value={jobData.employerInfo.positionInCompany || ''} onChange={e => setEmployerInfo('positionInCompany', e.target.value)} placeholder="e.g. HR Manager, CEO" />
              </div>
              <div>
                <Label className="text-sm mb-1.5 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Your Phone Number</Label>
                <Input value={jobData.employerInfo.phoneNumber || ''} onChange={e => setEmployerInfo('phoneNumber', e.target.value)} placeholder="e.g. +234 801 234 5678" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm mb-1.5 block">Contact Person Name</Label>
                <Input value={jobData.employerInfo.contactName || ''} onChange={e => setEmployerInfo('contactName', e.target.value)} placeholder="Recruiter / Agency name" />
              </div>
              <div>
                <Label className="text-sm mb-1.5 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Contact Email</Label>
                <Input type="email" value={jobData.employerInfo.contactEmail || ''} onChange={e => setEmployerInfo('contactEmail', e.target.value)} placeholder="contact@agency.com" />
              </div>
              <div>
                <Label className="text-sm mb-1.5 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Contact Phone</Label>
                <Input value={jobData.employerInfo.contactPhone || ''} onChange={e => setEmployerInfo('contactPhone', e.target.value)} placeholder="e.g. +234 801 234 5678" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location */}
      <Card className="border-0 glass-card">
        <CardHeader className="pb-2">
          <SectionHeader icon={MapPin} title="Location" subtitle="Where will this role be based?" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Work Arrangement <span className="text-destructive">*</span></Label>
            <div className="grid grid-cols-3 gap-3">
              {(['remote', 'hybrid', 'onsite'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setNested('location', 'type', type)}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    jobData.location.type === type
                      ? 'border-brand-orange bg-brand-orange/10 text-brand-orange'
                      : 'border-border hover:border-brand-orange/50 text-muted-foreground'
                  }`}
                >
                  {type === 'onsite' ? 'On-site' : type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {jobData.location.type !== 'remote' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm mb-1.5 block">City</Label>
                <Input value={jobData.location.city || ''} onChange={e => setNested('location', 'city', e.target.value)} placeholder="e.g. Lagos" />
              </div>
              <div>
                <Label className="text-sm mb-1.5 block">Country</Label>
                <Input value={jobData.location.country || ''} onChange={e => setNested('location', 'country', e.target.value)} placeholder="e.g. Nigeria" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compensation */}
      {showSalary ? (
        <Card className="border-0 glass-card">
          <CardHeader className="pb-2">
            <SectionHeader
              icon={DollarSign}
              title={isPaidInternship ? 'Stipend' : 'Compensation'}
              subtitle={isPaidInternship ? 'Monthly stipend for the internship' : 'Salary range for the position'}
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm mb-1.5 block">Currency</Label>
                <Select value={jobData.salary.currency} onValueChange={v => setNested('salary', 'currency', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm mb-1.5 block">{isPaidInternship ? 'Min Stipend' : 'Min Salary'}</Label>
                <Input
                  type="number"
                  min={0}
                  value={jobData.salary.min || ''}
                  onChange={e => setNested('salary', 'min', Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-sm mb-1.5 block">{isPaidInternship ? 'Max Stipend' : 'Max Salary'}</Label>
                <Input
                  type="number"
                  min={0}
                  value={jobData.salary.max || ''}
                  onChange={e => setNested('salary', 'max', Number(e.target.value))}
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-sm mb-1.5 block">Period</Label>
                {isPaidInternship ? (
                  <div className="flex h-10 items-center px-3 rounded-md border border-input bg-muted text-sm text-muted-foreground">
                    Per Month (Stipend)
                  </div>
                ) : (
                  <Select value={jobData.salary.period} onValueChange={v => setNested('salary', 'period', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SALARY_PERIOD_OPTIONS.map(p => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
            {jobData.salary.min > 0 && jobData.salary.max > 0 && jobData.salary.min > jobData.salary.max && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Minimum must be less than maximum
              </p>
            )}
          </CardContent>
        </Card>
      ) : isUnpaidInternship ? (
        <Card className="border-0 glass-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
              <Info className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-medium">Unpaid Internship — No Compensation</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  No monetary compensation for this role. Highlight learning and growth opportunities in the Benefits section below.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Application Method */}
      <Card className="border-0 glass-card">
        <CardHeader className="pb-2">
          <SectionHeader icon={Settings} title="Application Method" subtitle="How candidates should apply for this role" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">How should candidates apply?</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {([
                { value: 'platform', label: 'Via Platform', icon: CheckCircle },
                { value: 'email', label: 'Via Email', icon: Mail },
                { value: 'external', label: 'External URL', icon: Globe },
                { value: 'instructions', label: 'Instructions', icon: ClipboardList },
              ] as const).map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAppMethod('type', value)}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all flex flex-col items-center gap-1.5 ${
                    jobData.applicationMethod.type === value
                      ? 'border-brand-orange bg-brand-orange/10 text-brand-orange'
                      : 'border-border hover:border-brand-orange/50 text-muted-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {jobData.applicationMethod.type === 'email' && (
            <div>
              <Label className="text-sm mb-1.5 block">Application Email <span className="text-destructive">*</span></Label>
              <Input
                type="email"
                value={jobData.applicationMethod.email || ''}
                onChange={e => setAppMethod('email', e.target.value)}
                placeholder="careers@company.com"
              />
            </div>
          )}

          {jobData.applicationMethod.type === 'external' && (
            <div className="space-y-2">
              <Label className="text-sm mb-1.5 block">External Application URL(s)</Label>
              {(jobData.applicationMethod.externalUrls || ['']).map((url, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={url}
                    onChange={e => {
                      const urls = [...(jobData.applicationMethod.externalUrls || [''])];
                      urls[idx] = e.target.value;
                      setAppMethod('externalUrls', urls);
                    }}
                    placeholder="https://company.com/careers/apply"
                  />
                  {(jobData.applicationMethod.externalUrls || []).length > 1 && (
                    <Button type="button" variant="ghost" size="icon"
                      onClick={() => {
                        const urls = (jobData.applicationMethod.externalUrls || []).filter((_, i) => i !== idx);
                        setAppMethod('externalUrls', urls);
                      }}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm"
                onClick={() => setAppMethod('externalUrls', [...(jobData.applicationMethod.externalUrls || []), ''])}>
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Add URL
              </Button>
            </div>
          )}

          {jobData.applicationMethod.type === 'instructions' && (
            <div className="space-y-2">
              <Label className="text-sm mb-1.5 block">Application Instructions</Label>
              {(jobData.applicationMethod.instructions || ['']).map((instruction, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={instruction}
                    onChange={e => {
                      const instr = [...(jobData.applicationMethod.instructions || [''])];
                      instr[idx] = e.target.value;
                      setAppMethod('instructions', instr);
                    }}
                    placeholder={`Step ${idx + 1}: e.g. Send your CV to...`}
                  />
                  {(jobData.applicationMethod.instructions || []).length > 1 && (
                    <Button type="button" variant="ghost" size="icon"
                      onClick={() => {
                        const instr = (jobData.applicationMethod.instructions || []).filter((_, i) => i !== idx);
                        setAppMethod('instructions', instr);
                      }}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm"
                onClick={() => setAppMethod('instructions', [...(jobData.applicationMethod.instructions || []), ''])}>
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Step
              </Button>
            </div>
          )}

          <div>
            <Label className="text-sm font-medium mb-1.5 block">Custom Screening Questions (optional)</Label>
            <p className="text-xs text-muted-foreground mb-2">Candidates will be asked these questions during application</p>
            <TagInput
              items={jobData.applicationMethod.specificQuestions || []}
              onAdd={v => setAppMethod('specificQuestions', [...(jobData.applicationMethod.specificQuestions || []), v])}
              onRemove={idx => setAppMethod('specificQuestions', (jobData.applicationMethod.specificQuestions || []).filter((_, i) => i !== idx))}
              placeholder="e.g. Are you eligible to work in Nigeria?"
              colorClass="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
            />
          </div>
        </CardContent>
      </Card>

      {/* Responsibilities */}
      <Card className="border-0 glass-card">
        <CardHeader className="pb-2">
          <SectionHeader icon={ClipboardList} title="Responsibilities" subtitle="What the candidate will do day-to-day" />
        </CardHeader>
        <CardContent>
          <TagInput
            items={jobData.responsibilities}
            onAdd={v => addToList('responsibilities', v)}
            onRemove={idx => removeFromList('responsibilities', idx)}
            placeholder="e.g. Build and maintain scalable web applications..."
            colorClass="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
          />
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card className="border-0 glass-card">
        <CardHeader className="pb-2">
          <SectionHeader icon={GraduationCap} title="Requirements" subtitle="Qualifications and experience needed" />
        </CardHeader>
        <CardContent>
          <TagInput
            items={jobData.requirements}
            onAdd={v => addToList('requirements', v)}
            onRemove={idx => removeFromList('requirements', idx)}
            placeholder="e.g. 3+ years of experience with React..."
            colorClass="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
          />
        </CardContent>
      </Card>

      {/* Skills */}
      <Card className="border-0 glass-card">
        <CardHeader className="pb-2">
          <SectionHeader icon={Code} title="Required Skills" subtitle="Technical and soft skills for the role" />
        </CardHeader>
        <CardContent>
          <TagInput
            items={jobData.skills}
            onAdd={v => addToList('skills', v)}
            onRemove={idx => removeFromList('skills', idx)}
            placeholder="e.g. TypeScript, React, Node.js..."
            colorClass="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
          />
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card className="border-0 glass-card">
        <CardHeader className="pb-2">
          <SectionHeader
            icon={Gift}
            title={isUnpaidInternship ? 'Benefits & Learning Opportunities' : 'Benefits & Perks'}
            subtitle={isUnpaidInternship
              ? 'Highlight the value and experience candidates will gain'
              : 'What makes this role attractive'}
          />
        </CardHeader>
        <CardContent>
          <TagInput
            items={jobData.benefits}
            onAdd={v => addToList('benefits', v)}
            onRemove={idx => removeFromList('benefits', idx)}
            placeholder={isUnpaidInternship
              ? 'e.g. Mentorship from industry experts, Real project experience...'
              : 'e.g. Health insurance, Remote work, Annual leave...'}
            colorClass="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
          />
        </CardContent>
      </Card>

      {/* Save Footer */}
      <div className="flex items-center justify-between gap-3 pt-2 pb-8 border-t border-border">
        <Link href="/admin/my-jobs">
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button className="btn-gradient-primary text-white min-w-[140px]" onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
        </Button>
      </div>
    </div>
  );
}
