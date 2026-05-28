'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ApplicationsRedirectPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/super-admin/job-applications'); }, [router]);
  return null;
}
