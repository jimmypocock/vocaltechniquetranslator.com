// Client-side feedback submission
// This works with both local development (Next.js API) and production (API Gateway)

interface FeedbackData {
  originalWord: string;
  currentTransformation: string;
  suggestedTransformation: string;
  intensity: number;
  context: string;
  reason?: string;
  timestamp: string;
  id: string;
}

export async function submitFeedback(feedback: FeedbackData): Promise<void> {
  // Determine which endpoint to use
  let endpoint = '/api/feedback'; // Default for local development
  
  // Check if we have a production API endpoint configured
  const apiEndpoint = process.env.NEXT_PUBLIC_FEEDBACK_API_ENDPOINT;
  if (apiEndpoint) {
    endpoint = apiEndpoint;
  }
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedback),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Feedback submitted successfully:', result);
  } catch (error) {
    console.error('Error submitting feedback:', error);
    // Re-throw to let the caller handle it
    throw error;
  }
}

// Admin function to retrieve feedback (requires authentication)
export async function retrieveFeedback(adminSecret: string): Promise<FeedbackData[]> {
  let endpoint = '/api/feedback';
  
  const apiEndpoint = process.env.NEXT_PUBLIC_FEEDBACK_API_ENDPOINT;
  if (apiEndpoint) {
    endpoint = apiEndpoint;
  }
  
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminSecret}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized: Invalid admin secret');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result.feedback || [];
  } catch (error) {
    console.error('Error retrieving feedback:', error);
    throw error;
  }
}