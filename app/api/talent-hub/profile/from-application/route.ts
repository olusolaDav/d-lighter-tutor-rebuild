import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TalentProfile from '@/lib/models/TalentProfile';
import { getAuthUser } from '@/lib/auth';

// This endpoint creates or updates a talent profile from job application data
// It intelligently merges data rather than overwriting existing profile data
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const applicationData = await request.json();

    // Check if profile exists
    const existingProfile = await TalentProfile.findOne({ userId: user.id });

    if (existingProfile) {
      // Profile exists - only update empty fields (don't overwrite existing data)
      const updates: any = {};

      // Update personal info only if fields are empty
      if (!existingProfile.personalInfo?.firstName && applicationData.personalInfo?.firstName) {
        updates['personalInfo.firstName'] = applicationData.personalInfo.firstName;
      }
      if (!existingProfile.personalInfo?.lastName && applicationData.personalInfo?.lastName) {
        updates['personalInfo.lastName'] = applicationData.personalInfo.lastName;
      }
      if (!existingProfile.personalInfo?.email && applicationData.personalInfo?.email) {
        updates['personalInfo.email'] = applicationData.personalInfo.email;
      }
      if (!existingProfile.personalInfo?.phone && applicationData.personalInfo?.phone) {
        updates['personalInfo.phone'] = applicationData.personalInfo.phone;
      }
      if ((!existingProfile.personalInfo?.location?.city && applicationData.personalInfo?.location?.city)) {
        updates['personalInfo.location'] = applicationData.personalInfo.location;
      }

      // Update title and bio only if empty
      if (!existingProfile.title && applicationData.title) {
        updates.title = applicationData.title;
      }
      if (!existingProfile.bio && applicationData.bio) {
        updates.bio = applicationData.bio;
      }

      // Add new skills (don't duplicate existing ones)
      if (applicationData.skills?.length > 0) {
        const existingSkillNames = new Set(existingProfile.skills?.map((s: any) => s.name.toLowerCase()) || []);
        const newSkills = applicationData.skills.filter((s: any) => !existingSkillNames.has(s.name.toLowerCase()));
        if (newSkills.length > 0) {
          updates.$push = updates.$push || {};
          updates.$push.skills = { $each: newSkills };
        }
      }

      // Add new work experiences (don't duplicate)
      if (applicationData.experience?.length > 0) {
        const existingExps = new Set(
          existingProfile.experience?.map((e: any) => `${e.company}-${e.position}`.toLowerCase()) || []
        );
        const newExps = applicationData.experience.filter(
          (e: any) => !existingExps.has(`${e.company}-${e.position}`.toLowerCase())
        );
        if (newExps.length > 0) {
          updates.$push = updates.$push || {};
          updates.$push.experience = { $each: newExps };
        }
      }

      // Add new education entries (don't duplicate)
      if (applicationData.education?.length > 0) {
        const existingEdus = new Set(
          existingProfile.education?.map((e: any) => `${e.institution}-${e.degree}`.toLowerCase()) || []
        );
        const newEdus = applicationData.education.filter(
          (e: any) => !existingEdus.has(`${e.institution}-${e.degree}`.toLowerCase())
        );
        if (newEdus.length > 0) {
          updates.$push = updates.$push || {};
          updates.$push.education = { $each: newEdus };
        }
      }

      // Add new certifications (don't duplicate)
      if (applicationData.certifications?.length > 0) {
        const existingCerts = new Set(
          existingProfile.certifications?.map((c: any) => c.name.toLowerCase()) || []
        );
        const newCerts = applicationData.certifications.filter(
          (c: any) => !existingCerts.has(c.name.toLowerCase())
        );
        if (newCerts.length > 0) {
          updates.$push = updates.$push || {};
          updates.$push.certifications = { $each: newCerts };
        }
      }

      // Update portfolio links only if empty
      if (applicationData.portfolio) {
        if (!existingProfile.portfolio?.website && applicationData.portfolio.website) {
          updates['portfolio.website'] = applicationData.portfolio.website;
        }
        if (!existingProfile.portfolio?.github && applicationData.portfolio.github) {
          updates['portfolio.github'] = applicationData.portfolio.github;
        }
        if (!existingProfile.portfolio?.linkedin && applicationData.portfolio.linkedin) {
          updates['portfolio.linkedin'] = applicationData.portfolio.linkedin;
        }
        if (!existingProfile.portfolio?.twitter && applicationData.portfolio.twitter) {
          updates['portfolio.twitter'] = applicationData.portfolio.twitter;
        }
        if (!existingProfile.portfolio?.behance && applicationData.portfolio.behance) {
          updates['portfolio.behance'] = applicationData.portfolio.behance;
        }
        if (!existingProfile.portfolio?.dribbble && applicationData.portfolio.dribbble) {
          updates['portfolio.dribbble'] = applicationData.portfolio.dribbble;
        }
      }

      // Update resume if not set
      if (!existingProfile.resume && applicationData.resume) {
        updates.resume = applicationData.resume;
      }

      // Only update if there are changes
      if (Object.keys(updates).length > 0) {
        await TalentProfile.findByIdAndUpdate(existingProfile._id, updates);
      }

      const updatedProfile = await TalentProfile.findById(existingProfile._id)
        .populate('userId', 'firstName lastName email avatar');

      return NextResponse.json({
        success: true,
        data: updatedProfile,
        message: 'Profile updated with application data',
        isNew: false
      });
    } else {
      // No profile exists - create new one from application data
      const profile = new TalentProfile({
        userId: user.id,
        personalInfo: {
          firstName: applicationData.personalInfo?.firstName || '',
          lastName: applicationData.personalInfo?.lastName || '',
          email: applicationData.personalInfo?.email || '',
          phone: applicationData.personalInfo?.phone || '',
          location: applicationData.personalInfo?.location || { city: '', state: '', country: '' },
        },
        title: applicationData.title || 'Professional',
        bio: applicationData.bio || 'Experienced professional seeking new opportunities.',
        skills: applicationData.skills || [],
        experience: applicationData.experience || [],
        education: applicationData.education || [],
        certifications: applicationData.certifications || [],
        portfolio: applicationData.portfolio || {},
        resume: applicationData.resume || '',
        availability: applicationData.availability || {
          status: 'available',
          preferredJobType: ['full-time'],
          preferredLocation: 'remote',
        },
        languages: [],
        projects: [],
        profileViews: 0,
        featured: false,
        isActive: true,
      });

      await profile.save();
      await profile.populate('userId', 'firstName lastName email avatar');

      return NextResponse.json({
        success: true,
        data: profile,
        message: 'Profile created from application data',
        isNew: true
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Update profile from application error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
