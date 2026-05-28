# d-lighter-tutor-rebuild

## Cloudinary Resume Upload Setup

This project uploads candidate resumes to Cloudinary through a secure server-side API route.

### Required Environment Variables

Add these values to your `.env.local` file:

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
# Optional override for storage path
CLOUDINARY_RESUME_FOLDER=d-lighter-tutor/resumes
```

### How To Get The Values

1. Go to https://cloudinary.com and create an account (or sign in).
2. Open your Cloudinary Console Dashboard.
3. Copy these values from "API Environment variable" or the dashboard summary:
	- `CLOUDINARY_CLOUD_NAME`
	- `CLOUDINARY_API_KEY`
	- `CLOUDINARY_API_SECRET`
4. Paste them into `.env.local`.
5. Restart your Next.js server after updating env variables.

### Implementation Notes

- Resume uploads are handled by `POST /api/uploads/resume`.
- Allowed file types: PDF, DOC, DOCX.
- Max file size: 2MB.
- The app stores Cloudinary metadata (`url`, `publicId`, etc.) in the application record, not raw file data.
