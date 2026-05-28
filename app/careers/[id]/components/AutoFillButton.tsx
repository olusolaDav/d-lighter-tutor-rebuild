'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, Edit } from 'lucide-react';
import { toast } from 'sonner';

interface AutoFillButtonProps {
  onAutoFill: (profileData: any) => void;
}

export default function AutoFillButton({ onAutoFill }: AutoFillButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const router = useRouter();

  const handleAutoFill = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/talent-hub/profile');

      if (response.ok) {
        const data = await response.json();
        const profile = data.data;
        setProfileId(profile._id);

        // Map profile data to application form fields
        const applicationData = {
          personalInfo: {
            firstName: profile.personalInfo?.firstName || '',
            lastName: profile.personalInfo?.lastName || '',
            email: profile.personalInfo?.email || '',
            phone: profile.personalInfo?.phone || '',
            location: profile.personalInfo?.location ? 
              `${profile.personalInfo.location.city}, ${profile.personalInfo.location.state}, ${profile.personalInfo.location.country}`.replace(/^,\s*|,\s*$/g, '') : '',
            summary: profile.bio || '',
          },
          workExperience: profile.experience?.map((exp: any) => ({
            title: exp.position,
            company: exp.company,
            location: exp.location || '',
            employmentType: 'full-time',
            startDate: exp.duration.from ? new Date(exp.duration.from).toISOString().slice(0, 7) : '',
            endDate: exp.duration.to ? new Date(exp.duration.to).toISOString().slice(0, 7) : '',
            isCurrentRole: exp.duration.current || false,
            description: exp.description || ''
          })) || [],
          education: profile.education?.map((edu: any) => ({
            institution: edu.institution,
            degree: edu.degree,
            fieldOfStudy: edu.field,
            grade: edu.grade || '',
            startDate: edu.duration.from ? new Date(edu.duration.from).toISOString().slice(0, 7) : '',
            endDate: edu.duration.to ? new Date(edu.duration.to).toISOString().slice(0, 7) : '',
            isCurrentlyStudying: edu.isCurrentlyStudying || false,
            description: edu.description || ''
          })) || [],
          skills: profile.skills?.map((skill: any) => ({
            name: skill.name,
            proficiency: skill.level,
            yearsOfExperience: skill.yearsOfExperience || 0
          })) || [],
          certifications: profile.certifications?.map((cert: any) => {
            const hasExpiry = !!cert.expiryDate;
            return {
              name: cert.name,
              issuingOrganization: cert.issuer,
              issueDate: cert.issueDate ? new Date(cert.issueDate).toISOString().slice(0, 10) : '',
              expirationDate: hasExpiry ? new Date(cert.expiryDate).toISOString().slice(0, 10) : '',
              noExpiration: !hasExpiry,
              credentialId: '',
              credentialUrl: cert.credentialUrl || ''
            };
          }) || [],
          socialMedia: {
            linkedin: profile.portfolio?.linkedin || '',
            github: profile.portfolio?.github || '',
            portfolio: profile.portfolio?.website || '',
            website: profile.portfolio?.website || '',
            twitter: profile.portfolio?.twitter || '',
            behance: profile.portfolio?.behance || '',
            dribbble: profile.portfolio?.dribbble || ''
          },
          documents: {
            resume: profile.resume || '',
            coverLetter: '',
            portfolio: profile.portfolio?.website || '',
            otherDocuments: []
          },
          application: {
            coverLetter: profile.bio || '',
            whyInterested: '',
            salaryExpectation: '',
            availabilityDate: profile.availability?.startDate ? new Date(profile.availability.startDate).toISOString().slice(0, 10) : '',
            noticePeriod: '',
            willingToRelocate: profile.availability?.preferredLocation !== 'remote',
            requiresSponsorship: false
          }
        };

        onAutoFill(applicationData);
        toast.success('Application form filled with your resume data!');
      } else if (response.status === 404) {
        toast.error('No profile found. Please create your talent profile first.');
      } else {
        toast.error('Failed to load profile data');
      }
    } catch (error) {
      console.error('Error auto-filling form:', error);
      toast.error('Failed to auto-fill form');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditResume = () => {
    if (profileId) {
      // Store current URL in sessionStorage to redirect back after editing
      sessionStorage.setItem('redirectAfterEdit', window.location.href);
      router.push(`/talent-hub/create-profile/${profileId}`);
    } else {
      router.push('/talent-hub/create-profile');
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        type="button"
        variant="outline"
        onClick={handleAutoFill}
        disabled={isLoading}
        className="flex items-center space-x-2 border-brand-500 text-brand-600 hover:bg-brand-50 dark:border-brand-400 dark:text-brand-400 dark:hover:bg-brand-900/20"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileText className="w-4 h-4" />
        )}
        <span>Fill with Resume</span>
      </Button>

      {profileId && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleEditResume}
          className="text-gray-600 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400"
        >
          <Edit className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}