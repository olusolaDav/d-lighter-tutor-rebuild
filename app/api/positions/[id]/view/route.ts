import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Position from '@/lib/models/Position';

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;

    await Position.findOneAndUpdate(
      { _id: id, isActive: true, isApproved: true },
      { $inc: { views: 1 } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Position view tracking error:', error);
    return NextResponse.json({ success: false, error: 'Failed to track view' }, { status: 500 });
  }
}