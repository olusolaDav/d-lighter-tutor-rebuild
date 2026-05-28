import { NextRequest, NextResponse } from 'next/server';
import { getCloudinary } from '@/lib/cloudinary';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
const RESUME_FOLDER = process.env.CLOUDINARY_RESUME_FOLDER || 'd-lighter-tutor/resumes';

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
}

function toDataUri(file: File, buffer: Buffer) {
  return `data:${file.type};base64,${buffer.toString('base64')}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'Resume file is required.' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Upload PDF, DOC, or DOCX.' },
        { status: 400 }
      );
    }

    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File size must be greater than 0 and not exceed 2MB.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const cloudinary = getCloudinary();

    const uploadResult = await cloudinary.uploader.upload(toDataUri(file, buffer), {
      folder: RESUME_FOLDER,
      resource_type: 'raw',
      public_id: `resume_${Date.now()}_${sanitizeFileName(file.name)}`,
      use_filename: false,
      unique_filename: false,
      overwrite: false,
    });

    return NextResponse.json({
      success: true,
      data: {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        resourceType: uploadResult.resource_type,
        format: uploadResult.format,
      },
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Could not upload resume file at the moment. Please try again.' },
      { status: 500 }
    );
  }
}
