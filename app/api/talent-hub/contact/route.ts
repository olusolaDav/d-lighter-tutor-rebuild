
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Conversation from '@/lib/models/Conversation';
import Message from '@/lib/models/Message';
import TalentProfile from '@/lib/models/TalentProfile';
import { getAuthUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    console.log('Contact API - User:', user ? 'Found' : 'Not found');
    
    if (!user) {
      console.log('Contact API - No valid user found');
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please login to send messages' },
        { status: 401 }
      );
    }

    await connectDB();

    const { talentProfileId, message, subject } = await request.json();

    // Get talent profile and validate
    const talentProfile = await TalentProfile.findById(talentProfileId)
      .populate('userId', 'firstName lastName email');

    if (!talentProfile) {
      return NextResponse.json(
        { success: false, error: 'Talent profile not found' },
        { status: 404 }
      );
    }

    if (!talentProfile.isApproved) {
      return NextResponse.json(
        { success: false, error: 'Cannot contact unapproved talent' },
        { status: 400 }
      );
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [user.id, talentProfile.userId._id] }
    });

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [user.id, talentProfile.userId._id],
        isActive: true,
        unreadCount: new Map()
      });
      await conversation.save();
    }

    // Create message
    const newMessage = new Message({
      conversationId: conversation._id,
      senderId: user.id,
      recipientId: talentProfile.userId._id,
      content: message,
      type: 'text',
      isRead: false
    });

    await newMessage.save();

    // Update conversation with last message
    conversation.lastMessage = {
      content: message,
      senderId: user.id,
      createdAt: new Date()
    };

    // Update unread count for recipient
    const currentUnreadCount = conversation.unreadCount.get(talentProfile.userId._id.toString()) || 0;
    conversation.unreadCount.set(talentProfile.userId._id.toString(), currentUnreadCount + 1);

    await conversation.save();

    return NextResponse.json({
      success: true,
      data: {
        conversationId: conversation._id,
        messageId: newMessage._id
      },
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Contact talent error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
