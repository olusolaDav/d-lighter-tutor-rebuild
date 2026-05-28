
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Conversation from '@/lib/models/Conversation';
import Message from '@/lib/models/Message';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const conversationId = searchParams.get('conversationId');

    if (conversationId) {
      // Get messages for specific conversation
      const conversation = await Conversation.findById(conversationId)
        .populate('participants', 'firstName lastName email avatar');

      if (!conversation || !conversation.participants.some((p: any) => p._id.toString() === user.id)) {
        return NextResponse.json(
          { success: false, error: 'Conversation not found' },
          { status: 404 }
        );
      }

      const messages = await Message.find({ conversationId })
        .populate('senderId', 'firstName lastName avatar')
        .populate('recipientId', 'firstName lastName avatar')
        .sort({ createdAt: 1 });

      // Mark messages as read
      await Message.updateMany(
        {
          conversationId,
          recipientId: user.id,
          isRead: false
        },
        {
          isRead: true,
          readAt: new Date()
        }
      );

      // Reset unread count for this user
      conversation.unreadCount.set(user.id, 0);
      await conversation.save();

      return NextResponse.json({
        success: true,
        data: {
          conversation,
          messages
        }
      });
    } else {
      // Get all conversations for user
      const conversations = await Conversation.find({
        participants: user.id,
        isActive: true
      })
        .populate('participants', 'firstName lastName email avatar')
        .sort({ 'lastMessage.createdAt': -1 });

      return NextResponse.json({
        success: true,
        data: conversations
      });
    }
  } catch (error) {
    console.error('Messages API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

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

    const { conversationId, content, recipientId } = await request.json();

    // Validate conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(user.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid conversation' },
        { status: 400 }
      );
    }

    // Create new message
    const message = new Message({
      conversationId,
      senderId: user.id,
      recipientId,
      content,
      type: 'text',
      isRead: false
    });

    await message.save();

    // Update conversation
    conversation.lastMessage = {
      content,
      senderId: user.id,
      createdAt: new Date()
    };

    // Update unread count
    const currentUnreadCount = conversation.unreadCount.get(recipientId) || 0;
    conversation.unreadCount.set(recipientId, currentUnreadCount + 1);

    await conversation.save();

    await message.populate('senderId', 'firstName lastName avatar');

    return NextResponse.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
