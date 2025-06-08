import { NextRequest, NextResponse } from 'next/server';
import { getFeedbackStorage } from '@/lib/feedback-storage';

// For now, we'll use environment variables to control access
const ADMIN_SECRET = process.env.FEEDBACK_ADMIN_SECRET || 'your-secret-key-here';

interface FeedbackData {
  originalWord: string;
  currentTransformation: string;
  suggestedTransformation: string;
  intensity: number;
  context: string;
  reason?: string;
  timestamp: string;
  id: string;
  // Add server-side fields
  userAgent?: string;
  ip?: string;
  submittedAt?: string;
}

// POST /api/feedback - Submit new feedback
export async function POST(request: NextRequest) {
  try {
    const feedback: FeedbackData = await request.json();
    
    // Add server-side metadata
    const enrichedFeedback = {
      ...feedback,
      submittedAt: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || 'unknown',
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    };

    // Store feedback using configured storage method
    const storage = getFeedbackStorage();
    await storage.saveFeedback(enrichedFeedback);

    return NextResponse.json({ success: true, id: feedback.id });
  } catch (error) {
    console.error('[Feedback Error]:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

// GET /api/feedback - Retrieve feedback (admin only)
export async function GET(request: NextRequest) {
  // Check for admin authentication
  const authHeader = request.headers.get('authorization');
  const providedSecret = authHeader?.replace('Bearer ', '');
  
  if (providedSecret !== ADMIN_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Retrieve feedback using configured storage
    const storage = getFeedbackStorage();
    
    // Check if storage supports listing
    if ('listFeedback' in storage && typeof storage.listFeedback === 'function') {
      const feedbackList = await storage.listFeedback();
      return NextResponse.json({ feedback: feedbackList });
    } else {
      return NextResponse.json({
        message: 'Current storage method does not support listing feedback.',
        storageMethod: process.env.FEEDBACK_STORAGE_METHOD || 'log'
      });
    }
  } catch (error) {
    console.error('[Feedback Retrieval Error]:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve feedback' },
      { status: 500 }
    );
  }
}