import { NextRequest, NextResponse } from 'next/server';
import { getCloudinary } from '@/lib/cloudinary';
import { getAuthUser } from '@/lib/auth';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const BLOG_MEDIA_FOLDER = process.env.CLOUDINARY_BLOG_MEDIA_FOLDER || 'd-lighter-tutor/blog-media';

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
}

function toDataUri(file: File, buffer: Buffer) {
  return `data:${file.type};base64,${buffer.toString('base64')}`;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || !['admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const mediaType = formData.get('mediaType');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'Media file is required.' }, { status: 400 });
    }

    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File size must be greater than 0 and not exceed 20MB.' },
        { status: 400 }
      );
    }

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Upload an image or video file.' },
        { status: 400 }
      );
    }

    if (mediaType === 'image' && !isImage) {
      return NextResponse.json(
        { success: false, error: 'Expected an image file.' },
        { status: 400 }
      );
    }

    if (mediaType === 'video' && !isVideo) {
      return NextResponse.json(
        { success: false, error: 'Expected a video file.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const cloudinary = getCloudinary();

    const resourceType = isVideo ? 'video' : 'image';
    const uploadResult = await cloudinary.uploader.upload(toDataUri(file, buffer), {
      folder: BLOG_MEDIA_FOLDER,
      resource_type: resourceType,
      public_id: `${resourceType}_${Date.now()}_${sanitizeFileName(file.name)}`,
      use_filename: false,
      unique_filename: false,
      overwrite: false,
    });

    return NextResponse.json({
      success: true,
      data: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        resourceType: uploadResult.resource_type,
        format: uploadResult.format,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      },
    });
  } catch (error) {
    console.error('Blog media upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Could not upload media at the moment. Please try again.' },
      { status: 500 }
    );
  }
}
