import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TalentProfile from '@/lib/models/TalentProfile';
import { getAuthUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;
    const profile = await TalentProfile.findById(id)
      .populate('userId', 'firstName lastName email avatar');

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Check if user owns this profile or is admin
    if (profile.userId._id.toString() !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'html';

    if (format === 'pdf') {
      try {
        // Use jsPDF for PDF generation
        const jsPDF = require('jspdf').jsPDF;
        const doc = new jsPDF('p', 'mm', 'a4');

        // Set font
        doc.setFont('helvetica');

        // Generate PDF content
        generatePDFContent(doc, profile);

        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

        return new Response(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${profile.personalInfo.firstName}_${profile.personalInfo.lastName}_Resume.pdf"`
          }
        });
      } catch (pdfError) {
        console.error('PDF generation error:', pdfError);
        return Response.json({ 
          error: `PDF generation failed: ${pdfError.message}. Please try again later.` 
        }, { status: 500 });
      }
    } else {
      // Generate HTML resume for preview
      const resumeHTML = generateResumeHTML(profile);
      return new Response(resumeHTML, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `inline; filename="${profile.personalInfo.firstName}_${profile.personalInfo.lastName}_Resume.html"`
        }
      });
    }

  } catch (error) {
    console.error('Resume generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate resume' },
      { status: 500 }
    );
  }
}

function generatePDFContent(doc: any, profile: any): void {
  const formatDate = (date: Date | string) => {
    if (!date) return '';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const formatLocation = (location: any) => {
    const parts = [location.city, location.state, location.country].filter(Boolean);
    return parts.join(', ');
  };

  let yPosition = 30;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20; // Increased margin for better document width
  const maxWidth = pageWidth - (margin * 2);

  // Header - matching the HTML layout exactly
  doc.setFontSize(28);
  doc.setTextColor(51, 51, 51); // Dark gray like HTML
  doc.setFont('times', 'bold');
  const nameText = `${profile.personalInfo.firstName} ${profile.personalInfo.lastName}`;
  const nameWidth = doc.getTextWidth(nameText);
  doc.text(nameText, (pageWidth - nameWidth) / 2, yPosition);
  yPosition += 10;

  // Title with italic styling
  doc.setFontSize(14);
  doc.setTextColor(102, 102, 102); // Gray color
  doc.setFont('times', 'italic');
  const titleText = profile.title || 'Professional';
  const titleWidth = doc.getTextWidth(titleText);
  doc.text(titleText, (pageWidth - titleWidth) / 2, yPosition);
  yPosition += 12;

  // Contact info with proper spacing
  doc.setFontSize(11);
  doc.setTextColor(51, 51, 51);
  doc.setFont('times', 'normal');
  
  const contactItems = [
    profile.personalInfo.email,
    profile.personalInfo.phone,
    formatLocation(profile.personalInfo.location),
    profile.personalInfo.nationality
  ].filter(Boolean);

  // Display contact items in a flex-like layout
  const contactText = contactItems.join(' • ');
  const contactWidth = doc.getTextWidth(contactText);
  doc.text(contactText, (pageWidth - contactWidth) / 2, yPosition);
  yPosition += 8;

  // Header border - thicker line like HTML
  doc.setLineWidth(1);
  doc.setDrawColor(51, 51, 51);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 20;

  // Professional Summary
  if (profile.bio) {
    doc.setFontSize(15);
    doc.setTextColor(51, 51, 51);
    doc.setFont('times', 'bold');
    doc.text('PROFESSIONAL SUMMARY', margin, yPosition);
    yPosition += 4;
    
    // Section underline
    doc.setLineWidth(0.5);
    doc.setDrawColor(51, 51, 51);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setTextColor(51, 51, 51);
    doc.setFont('times', 'normal');
    const bioLines = doc.splitTextToSize(profile.bio, maxWidth);
    doc.text(bioLines, margin, yPosition);
    yPosition += bioLines.length * 6 + 15;
  }

  // Skills
  if (profile.skills && profile.skills.length > 0) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 30;
    }

    doc.setFontSize(15);
    doc.setTextColor(51, 51, 51);
    doc.setFont('times', 'bold');
    doc.text('SKILLS & EXPERTISE', margin, yPosition);
    yPosition += 4;
    
    // Section underline
    doc.setLineWidth(0.5);
    doc.setDrawColor(51, 51, 51);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    profile.skills.forEach((skill: any) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 30;
      }
      
      // Left border for skill items like HTML
      doc.setLineWidth(1.5);
      doc.setDrawColor(51, 51, 51);
      doc.line(margin, yPosition - 2, margin, yPosition + 8);
      
      doc.setFontSize(11);
      doc.setTextColor(51, 51, 51);
      doc.setFont('times', 'bold');
      doc.text(skill.name, margin + 5, yPosition);
      yPosition += 5;
      
      doc.setFontSize(10);
      doc.setTextColor(102, 102, 102);
      doc.setFont('times', 'normal');
      doc.text(`${skill.level.charAt(0).toUpperCase() + skill.level.slice(1)} • ${skill.yearsOfExperience} years`, margin + 5, yPosition);
      yPosition += 8;
    });
    yPosition += 10;
  }

  // Experience
  if (profile.experience && profile.experience.length > 0) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 30;
    }

    doc.setFontSize(15);
    doc.setTextColor(51, 51, 51);
    doc.setFont('times', 'bold');
    doc.text('WORK EXPERIENCE', margin, yPosition);
    yPosition += 4;
    
    // Section underline
    doc.setLineWidth(0.5);
    doc.setDrawColor(51, 51, 51);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    profile.experience.forEach((exp: any) => {
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 30;
      }

      // Left border for experience items
      const itemStartY = yPosition;
      
      doc.setFontSize(12);
      doc.setTextColor(51, 51, 51);
      doc.setFont('times', 'bold');
      doc.text(exp.position, margin + 5, yPosition);
      yPosition += 6;

      doc.setFontSize(11);
      doc.setTextColor(51, 51, 51);
      doc.setFont('times', 'bold');
      doc.text(exp.company, margin + 5, yPosition);
      yPosition += 5;

      if (exp.location) {
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.setFont('times', 'normal');
        doc.text(exp.location, margin + 5, yPosition);
        yPosition += 5;
      }

      doc.setFontSize(10);
      doc.setTextColor(102, 102, 102);
      doc.setFont('times', 'italic');
      const duration = `${formatDate(exp.duration.from)} - ${exp.duration.current ? 'Present' : (exp.duration.to ? formatDate(exp.duration.to) : 'Present')}`;
      doc.text(duration, margin + 5, yPosition);
      yPosition += 8;

      if (exp.description) {
        doc.setTextColor(51, 51, 51);
        doc.setFont('times', 'normal');
        const descLines = doc.splitTextToSize(exp.description, maxWidth - 10);
        doc.text(descLines, margin + 5, yPosition);
        yPosition += descLines.length * 5 + 5;
      }

      if (exp.achievements && exp.achievements.length > 0) {
        exp.achievements.forEach((achievement: string) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 30;
          }
          const achLines = doc.splitTextToSize(`• ${achievement}`, maxWidth - 15);
          doc.text(achLines, margin + 10, yPosition);
          yPosition += achLines.length * 5;
        });
      }

      // Draw left border for the entire experience item
      const itemEndY = yPosition;
      doc.setLineWidth(1.5);
      doc.setDrawColor(51, 51, 51);
      doc.line(margin, itemStartY - 2, margin, itemEndY);
      
      yPosition += 10;
    });
  }

  // Projects
  if (profile.projects && profile.projects.length > 0) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 30;
    }

    doc.setFontSize(15);
    doc.setTextColor(51, 51, 51);
    doc.setFont('times', 'bold');
    doc.text('PROJECTS', margin, yPosition);
    yPosition += 4;
    
    // Section underline
    doc.setLineWidth(0.5);
    doc.setDrawColor(51, 51, 51);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    profile.projects.forEach((project: any) => {
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 30;
      }

      const itemStartY = yPosition;

      doc.setFontSize(12);
      doc.setTextColor(51, 51, 51);
      doc.setFont('times', 'bold');
      doc.text(project.name, margin + 5, yPosition);
      yPosition += 8;

      doc.setFontSize(11);
      doc.setTextColor(51, 51, 51);
      doc.setFont('times', 'normal');
      const descLines = doc.splitTextToSize(project.description, maxWidth - 10);
      doc.text(descLines, margin + 5, yPosition);
      yPosition += descLines.length * 5 + 5;

      if (project.technologies && project.technologies.length > 0) {
        // Create tech tags similar to HTML
        doc.setFontSize(9);
        doc.setTextColor(51, 51, 51);
        doc.setFont('times', 'normal');
        const techText = `Technologies: ${project.technologies.join(', ')}`;
        doc.text(techText, margin + 5, yPosition);
        yPosition += 6;
      }

      if (project.url || project.github) {
        if (project.url) {
          doc.setFontSize(11);
          doc.setTextColor(51, 51, 51);
          doc.setFont('times', 'bold');
          doc.text('Live Demo', margin + 5, yPosition);
          yPosition += 5;
          
          doc.setFontSize(10);
          doc.setTextColor(51, 51, 51);
          doc.setFont('times', 'normal');
          doc.text(project.url, margin + 5, yPosition);
          yPosition += 6;
        }

        if (project.github) {
          doc.setFontSize(11);
          doc.setTextColor(51, 51, 51);
          doc.setFont('times', 'bold');
          doc.text('GitHub', margin + 5, yPosition);
          yPosition += 5;
          
          doc.setFontSize(10);
          doc.setTextColor(51, 51, 51);
          doc.setFont('times', 'normal');
          doc.text(project.github, margin + 5, yPosition);
          yPosition += 6;
        }
      }

      // Draw left border for the project item
      const itemEndY = yPosition;
      doc.setLineWidth(1.5);
      doc.setDrawColor(51, 51, 51);
      doc.line(margin, itemStartY - 2, margin, itemEndY);

      yPosition += 10;
    });
  }

  // Education
  if (profile.education && profile.education.length > 0) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 30;
    }

    doc.setFontSize(15);
    doc.setTextColor(51, 51, 51);
    doc.setFont('times', 'bold');
    doc.text('EDUCATION', margin, yPosition);
    yPosition += 4;
    
    // Section underline
    doc.setLineWidth(0.5);
    doc.setDrawColor(51, 51, 51);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    profile.education.forEach((edu: any) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 30;
      }

      const itemStartY = yPosition;

      doc.setFontSize(12);
      doc.setTextColor(51, 51, 51);
      doc.setFont('times', 'bold');
      doc.text(`${edu.degree} in ${edu.field}`, margin + 5, yPosition);
      yPosition += 6;

      doc.setFontSize(11);
      doc.setTextColor(51, 51, 51);
      doc.setFont('times', 'bold');
      doc.text(edu.institution, margin + 5, yPosition);
      yPosition += 5;

      if (edu.location) {
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.setFont('times', 'normal');
        doc.text(edu.location, margin + 5, yPosition);
        yPosition += 5;
      }

      doc.setFontSize(10);
      doc.setTextColor(102, 102, 102);
      doc.setFont('times', 'italic');
      const duration = `${formatDate(edu.duration.from)} - ${edu.duration.to ? formatDate(edu.duration.to) : 'Present'}`;
      doc.text(duration, margin + 5, yPosition);
      yPosition += 5;

      if (edu.grade) {
        doc.setTextColor(5, 150, 105);
        doc.setFont('times', 'bold');
        doc.text(`Grade: ${edu.grade}`, margin + 5, yPosition);
        yPosition += 5;
      }

      // Draw left border
      const itemEndY = yPosition;
      doc.setLineWidth(1.5);
      doc.setDrawColor(51, 51, 51);
      doc.line(margin, itemStartY - 2, margin, itemEndY);

      yPosition += 10;
    });
  }

  // Certifications
  if (profile.certifications && profile.certifications.length > 0) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 30;
    }

    doc.setFontSize(15);
    doc.setTextColor(51, 51, 51);
    doc.setFont('times', 'bold');
    doc.text('CERTIFICATIONS', margin, yPosition);
    yPosition += 4;
    
    // Section underline
    doc.setLineWidth(0.5);
    doc.setDrawColor(51, 51, 51);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    profile.certifications.forEach((cert: any) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 30;
      }

      const itemStartY = yPosition;

      doc.setFontSize(12);
      doc.setTextColor(51, 51, 51);
      doc.setFont('times', 'bold');
      doc.text(cert.name, margin + 5, yPosition);
      yPosition += 6;

      doc.setFontSize(11);
      doc.setTextColor(51, 51, 51);
      doc.setFont('times', 'bold');
      doc.text(cert.issuer, margin + 5, yPosition);
      yPosition += 5;

      doc.setFontSize(10);
      doc.setTextColor(102, 102, 102);
      doc.setFont('times', 'italic');
      doc.text(`Issued: ${formatDate(cert.issueDate)}`, margin + 5, yPosition);
      yPosition += 5;

      if (cert.credentialUrl) {
        doc.setTextColor(51, 51, 51);
        doc.setFont('times', 'normal');
        doc.text(`🏆 View Credential: ${cert.credentialUrl}`, margin + 5, yPosition);
        yPosition += 5;
      }

      // Draw left border
      const itemEndY = yPosition;
      doc.setLineWidth(1.5);
      doc.setDrawColor(51, 51, 51);
      doc.line(margin, itemStartY - 2, margin, itemEndY);

      yPosition += 10;
    });
  }

  // Languages
  if (profile.languages && profile.languages.length > 0) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 30;
    }

    doc.setFontSize(15);
    doc.setTextColor(51, 51, 51);
    doc.setFont('times', 'bold');
    doc.text('LANGUAGES', margin, yPosition);
    yPosition += 4;
    
    // Section underline
    doc.setLineWidth(0.5);
    doc.setDrawColor(51, 51, 51);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    profile.languages.forEach((lang: any) => {
      const itemStartY = yPosition;
      
      doc.setFontSize(11);
      doc.setTextColor(51, 51, 51);
      doc.setFont('times', 'bold');
      doc.text(`${lang.name} - ${lang.proficiency.charAt(0).toUpperCase() + lang.proficiency.slice(1)}`, margin + 5, yPosition);
      yPosition += 6;

      // Draw left border
      doc.setLineWidth(1.5);
      doc.setDrawColor(51, 51, 51);
      doc.line(margin, itemStartY - 2, margin, yPosition);
    });
    yPosition += 10;
  }

  // Portfolio & Links
  if (Object.values(profile.portfolio).some(Boolean)) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 30;
    }

    doc.setFontSize(15);
    doc.setTextColor(51, 51, 51);
    doc.setFont('times', 'bold');
    doc.text('PORTFOLIO & LINKS', margin, yPosition);
    yPosition += 4;
    
    // Section underline
    doc.setLineWidth(0.5);
    doc.setDrawColor(51, 51, 51);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Portfolio items with icons and proper formatting
    if (profile.portfolio.website) {
      doc.setFontSize(11);
      doc.setTextColor(51, 51, 51);
      doc.setFont('times', 'bold');
      doc.text('Portfolio URL', margin + 8, yPosition);
      yPosition += 5;
      
      doc.setFontSize(10);
      doc.setTextColor(51, 51, 51);
      doc.setFont('times', 'normal');
      doc.text(profile.portfolio.website, margin + 8, yPosition);
      yPosition += 8;
    }

    if (profile.portfolio.github) {
      doc.setFontSize(11);
      doc.setTextColor(51, 51, 51);
      doc.setFont('times', 'bold');
      doc.text('GitHub Profile', margin + 8, yPosition);
      yPosition += 5;
      
      doc.setFontSize(10);
      doc.setTextColor(51, 51, 51);
      doc.setFont('times', 'normal');
      doc.text(profile.portfolio.github, margin + 8, yPosition);
      yPosition += 8;
    }

    if (profile.portfolio.linkedin) {
      doc.setFontSize(11);
      doc.setTextColor(51, 51, 51);
      doc.setFont('times', 'bold');
      doc.text('LinkedIn Profile', margin + 8, yPosition);
      yPosition += 5;
      
      doc.setFontSize(10);
      doc.setTextColor(51, 51, 51);
      doc.setFont('times', 'normal');
      doc.text(profile.portfolio.linkedin, margin + 8, yPosition);
      yPosition += 8;
    }

    if (profile.portfolio.twitter) {
      doc.setFontSize(11);
      doc.setTextColor(51, 51, 51);
      doc.setFont('times', 'bold');
      doc.text('Twitter Profile', margin + 8, yPosition);
      yPosition += 5;
      
      doc.setFontSize(10);
      doc.setTextColor(51, 51, 51);
      doc.setFont('times', 'normal');
      doc.text(profile.portfolio.twitter, margin + 8, yPosition);
      yPosition += 8;
    }

    yPosition += 10;
  }

  // Footer - centered and styled like HTML
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.setFont('times', 'italic');
  const footerText = `Generated from ALOT Careers • ${new Date().toLocaleDateString()}`;
  const footerWidth = doc.getTextWidth(footerText);
  doc.text(footerText, (pageWidth - footerWidth) / 2, doc.internal.pageSize.height - 15);
}

function generateResumeHTML(profile: any): string {
  const formatDate = (date: Date | string) => {
    if (!date) return '';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const formatLocation = (location: any) => {
    const parts = [location.city, location.state, location.country].filter(Boolean);
    return parts.join(', ');
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${profile.personalInfo.firstName} ${profile.personalInfo.lastName} - Resume</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Times New Roman', Times, serif;
            line-height: 1.6;
            color: #333;
            max-width: 210mm;
            margin: 0 auto;
            padding: 20mm;
            background: white;
            min-height: 100vh;
        }

        .resume-container {
            background: white;
            width: 100%;
        }

        .header {
            text-align: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid #333;
        }

        .name {
            font-size: 2.5rem;
            font-weight: bold;
            color: #333;
            margin-bottom: 0.5rem;
        }

        .title {
            font-size: 1.2rem;
            color: #666;
            margin-bottom: 1rem;
            font-style: italic;
        }

        .contact-info {
            display: flex;
            justify-content: center;
            gap: 1.5rem;
            flex-wrap: wrap;
            font-size: 0.95rem;
            color: #333;
        }

        .contact-info span {
            padding: 0;
        }

        .section {
            margin: 2rem 0;
        }

        .section-title {
            font-size: 1.3rem;
            font-weight: bold;
            color: #333;
            border-bottom: 1px solid #333;
            padding-bottom: 0.5rem;
            margin-bottom: 1rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .bio {
            font-size: 1rem;
            line-height: 1.7;
            text-align: justify;
            margin-bottom: 1rem;
            color: #333;
            padding: 0;
            background: none;
            border: none;
        }

        .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 0.75rem;
        }

        .skill-item {
            background: none;
            padding: 0.5rem 0;
            border: none;
            border-left: 3px solid #333;
            padding-left: 1rem;
            box-shadow: none;
            transition: none;
        }

        .skill-item:hover {
            transform: none;
        }

        .skill-name {
            font-weight: bold;
            color: #333;
            font-size: 1rem;
        }

        .skill-level {
            font-size: 0.9rem;
            color: #666;
            margin-top: 0.25rem;
        }

        .experience-item, .education-item, .project-item, .cert-item {
            margin-bottom: 1.5rem;
            padding: 0;
            background: none;
            border: none;
            border-left: 3px solid #333;
            padding-left: 1rem;
            box-shadow: none;
            position: relative;
        }

        .job-title, .degree, .project-name, .cert-name {
            font-size: 1.1rem;
            font-weight: bold;
            color: #333;
            margin-bottom: 0.25rem;
        }

        .company, .institution {
            font-weight: bold;
            color: #333;
            margin-bottom: 0.25rem;
            font-size: 1rem;
        }

        .duration {
            font-size: 0.9rem;
            color: #666;
            margin-bottom: 0.5rem;
            font-style: italic;
        }

        .description {
            line-height: 1.6;
            margin-top: 0.5rem;
            color: #333;
        }

        .technologies {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-top: 0.5rem;
        }

        .tech-tag {
            background: #f5f5f5;
            color: #333;
            padding: 0.2rem 0.5rem;
            border-radius: 3px;
            font-size: 0.8rem;
            font-weight: normal;
            border: 1px solid #ddd;
        }

        .languages {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
        }

        .language-item {
            background: none;
            padding: 0.5rem 0;
            border: none;
            border-left: 3px solid #333;
            padding-left: 1rem;
            font-weight: normal;
        }

        .portfolio-section {
            background: none;
            padding: 0;
            border: none;
        }

        .portfolio-item {
            margin-bottom: 0.75rem;
            padding: 0;
            background: none;
            border: none;
            transition: none;
        }

        .portfolio-item:hover {
            box-shadow: none;
            transform: none;
        }

        .portfolio-item:last-child {
            margin-bottom: 0;
        }

        .portfolio-label {
            font-weight: bold;
            color: #333;
            font-size: 0.95rem;
            margin-bottom: 0.25rem;
            display: inline;
            margin-right: 0.5rem;
        }

        .portfolio-link {
            color: #333;
            text-decoration: underline;
            font-weight: normal;
            word-break: break-all;
            transition: none;
        }

        .portfolio-link:hover {
            color: #333;
            text-decoration: underline;
        }

        .portfolio-icon-wrapper {
            display: flex;
            align-items: flex-start;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
        }

        .portfolio-icon {
            width: 16px;
            height: 16px;
            opacity: 0.8;
            margin-top: 2px;
            flex-shrink: 0;
        }

        @media print {
            body {
                padding: 15mm;
                background: white;
            }

            .resume-container {
                box-shadow: none;
                border: none;
            }

            .contact-info {
                gap: 1rem;
            }
        }
    </style>
</head>
<body>
    <div class="resume-container">
        <div class="header">
            <h1 class="name">${profile.personalInfo.firstName} ${profile.personalInfo.lastName}</h1>
            <p class="title">${profile.title}</p>
            <div class="contact-info">
                <span>${profile.personalInfo.email}</span>
                <span>•</span>
                <span>${profile.personalInfo.phone}</span>
                ${formatLocation(profile.personalInfo.location) ? `<span>•</span><span>${formatLocation(profile.personalInfo.location)}</span>` : ''}
                ${profile.personalInfo.nationality ? `<span>•</span><span>${profile.personalInfo.nationality}</span>` : ''}
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">Professional Summary</h2>
            <p class="bio">${profile.bio}</p>
        </div>

        ${profile.skills && profile.skills.length > 0 ? `
        <div class="section">
            <h2 class="section-title">Skills & Expertise</h2>
            <div class="skills-grid">
                ${profile.skills.map((skill: any) => `
                    <div class="skill-item">
                        <div class="skill-name">${skill.name}</div>
                        <div class="skill-level">${skill.level.charAt(0).toUpperCase() + skill.level.slice(1)} • ${skill.yearsOfExperience} years</div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        ${profile.experience && profile.experience.length > 0 ? `
        <div class="section">
            <h2 class="section-title">Work Experience</h2>
            ${profile.experience.map((exp: any) => `
                <div class="experience-item">
                    <div class="job-title">${exp.position}</div>
                    <div class="company">${exp.company}</div>
                    ${exp.location ? `<div style="color: #64748b; font-size: 0.9rem; margin-bottom: 0.25rem;">${exp.location}</div>` : ''}
                    <div class="duration">
                        ${formatDate(exp.duration.from)} - ${exp.duration.current ? 'Present' : (exp.duration.to ? formatDate(exp.duration.to) : 'Present')}
                    </div>
                    ${exp.description ? `<div class="description">${exp.description}</div>` : ''}
                    ${exp.achievements && exp.achievements.length > 0 ? `
                        <ul style="margin-top: 0.75rem; padding-left: 1.5rem; color: #374151;">
                            ${exp.achievements.map((achievement: string) => `<li style="margin-bottom: 0.25rem;">${achievement}</li>`).join('')}
                        </ul>
                    ` : ''}
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${profile.projects && profile.projects.length > 0 ? `
        <div class="section">
            <h2 class="section-title">Projects</h2>
            ${profile.projects.map((project: any) => `
                <div class="project-item">
                    <div class="project-name">${project.name}</div>
                    <div class="description">${project.description}</div>
                    ${project.technologies && project.technologies.length > 0 ? `
                        <div class="technologies">
                            ${project.technologies.map((tech: string) => `<span class="tech-tag">${tech}</span>`).join('')}
                        </div>
                    ` : ''}
                    ${project.url || project.github ? `
                        <div style="margin-top: 0.75rem;">
                            ${project.url ? `
                                <div style="margin-bottom: 0.5rem;">
                                    <span class="portfolio-label">Live Demo</span>
                                    <a href="${project.url}" class="portfolio-link" target="_blank">${project.url}</a>
                                </div>
                            ` : ''}
                            ${project.github ? `
                                <div style="margin-bottom: 0.5rem;">
                                    <span class="portfolio-label">GitHub</span>
                                    <a href="${project.github}" class="portfolio-link" target="_blank">${project.github}</a>
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${profile.education && profile.education.length > 0 ? `
        <div class="section">
            <h2 class="section-title">Education</h2>
            ${profile.education.map((edu: any) => `
                <div class="education-item">
                    <div class="degree">${edu.degree} in ${edu.field}</div>
                    <div class="institution">${edu.institution}</div>
                    ${edu.location ? `<div style="color: #64748b; font-size: 0.9rem; margin-bottom: 0.25rem;">${edu.location}</div>` : ''}
                    <div class="duration">${formatDate(edu.duration.from)} - ${edu.duration.to ? formatDate(edu.duration.to) : 'Present'}</div>
                    ${edu.grade ? `<div style="color: #059669; font-weight: 500; margin-top: 0.5rem;">Grade: ${edu.grade}</div>` : ''}
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${profile.certifications && profile.certifications.length > 0 ? `
        <div class="section">
            <h2 class="section-title">Certifications</h2>
            ${profile.certifications.map((cert: any) => `
                <div class="cert-item">
                    <div class="cert-name">${cert.name}</div>
                    <div class="company">${cert.issuer}</div>
                    <div class="duration">Issued: ${formatDate(cert.issueDate)}</div>
                    ${cert.credentialUrl ? `<a href="${cert.credentialUrl}" class="portfolio-link" target="_blank">🏆 View Credential</a>` : ''}
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${profile.languages && profile.languages.length > 0 ? `
        <div class="section">
            <h2 class="section-title">Languages</h2>
            <div class="languages">
                ${profile.languages.map((lang: any) => `
                    <div class="language-item">
                        <strong>${lang.name}</strong> - ${lang.proficiency.charAt(0).toUpperCase() + lang.proficiency.slice(1)}
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        ${Object.values(profile.portfolio).some(Boolean) ? `
        <div class="section">
            <h2 class="section-title">Portfolio & Links</h2>
            <div class="portfolio-section">
                ${profile.portfolio.website ? `
                    <div class="portfolio-item">
                        <div class="portfolio-icon-wrapper">
                            <svg class="portfolio-icon" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="2" y1="12" x2="22" y2="12"></line>
                                <path d="m2 12c0-5.5 2.5-10 7.5-10s7.5 4.5 7.5 10-2.5 10-7.5 10-7.5-4.5-7.5-10z"></path>
                            </svg>
                            <div>
                                <div class="portfolio-label">Portfolio URL</div>
                                <a href="${profile.portfolio.website}" class="portfolio-link" target="_blank">${profile.portfolio.website}</a>
                            </div>
                        </div>
                    </div>
                ` : ''}
                ${profile.portfolio.github ? `
                    <div class="portfolio-item">
                        <div class="portfolio-icon-wrapper">
                            <svg class="portfolio-icon" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2">
                                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                                <path d="M9 18c-4.51 2-5-2-7-2"></path>
                            </svg>
                            <div>
                                <div class="portfolio-label">GitHub Profile</div>
                                <a href="${profile.portfolio.github}" class="portfolio-link" target="_blank">${profile.portfolio.github}</a>
                            </div>
                        </div>
                    </div>
                ` : ''}
                ${profile.portfolio.linkedin ? `
                    <div class="portfolio-item">
                        <div class="portfolio-icon-wrapper">
                            <svg class="portfolio-icon" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2">
                                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                                <rect x="2" y="9" width="4" height="12"></rect>
                                <circle cx="4" cy="4" r="2"></circle>
                            </svg>
                            <div>
                                <div class="portfolio-label">LinkedIn Profile</div>
                                <a href="${profile.portfolio.linkedin}" class="portfolio-link" target="_blank">${profile.portfolio.linkedin}</a>
                            </div>
                        </div>
                    </div>
                ` : ''}
                ${profile.portfolio.twitter ? `
                    <div class="portfolio-item">
                        <div class="portfolio-icon-wrapper">
                            <svg class="portfolio-icon" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2">
                                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                            </svg>
                            <div>
                                <div class="portfolio-label">Twitter Profile</div>
                                <a href="${profile.portfolio.twitter}" class="portfolio-link" target="_blank">${profile.portfolio.twitter}</a>
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
        ` : ''}

        <div style="text-align: center; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #333; color: #666; font-size: 0.8rem; font-style: italic;">
            Generated from ALOT Careers • ${new Date().toLocaleDateString()}
        </div>
    </div>
</body>
</html>
  `;
}