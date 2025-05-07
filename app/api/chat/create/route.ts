import { NextResponse } from 'next/server';
import { createChat } from '@/lib/chat-store';

export async function POST() {
  try {
    // Create a new chat
    const chatId = await createChat();
    
    // Return the chat ID
    return NextResponse.json({ chatId });
  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json(
      { error: 'Failed to create chat' },
      { status: 500 }
    );
  }
}