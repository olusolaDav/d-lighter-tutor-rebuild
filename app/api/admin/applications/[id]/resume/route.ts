import { NextRequest, NextResponse } from 'next/server';
import Application from '@/lib/models/Application';
import connectDB from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import { getCloudinary } from '@/lib/cloudinary';

type Params = { params: Promise<{ id: string }> };

function getDownloadPublicId(publicId: string, format?: string) {
  if (!format) {
    return publicId;
  }

  const suffix = `.${format}`;
  return publicId.endsWith(suffix) ? publicId.slice(0, -suffix.length) : publicId;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const user = await getAuthUser(request);
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const application = await Application.findById(id).select('resume').lean();

    if (!application?.resume?.publicId) {
      return NextResponse.json({ success: false, error: 'Resume not found' }, { status: 404 });
    }

    const cloudinary = getCloudinary();
    const downloadUrl = cloudinary.utils.private_download_url(
      getDownloadPublicId(application.resume.publicId, application.resume.format),
      application.resume.format,
      {
        resource_type: 'raw',
        type: 'upload',
        attachment: application.resume.fileName || true,
        expires_at: Math.floor(Date.now() / 1000) + 60 * 10,
      }
    );

    return NextResponse.redirect(downloadUrl);
  } catch (error) {
    console.error('Resume download error:', error);
    return NextResponse.json({ success: false, error: 'Failed to download resume' }, { status: 500 });
  }
}