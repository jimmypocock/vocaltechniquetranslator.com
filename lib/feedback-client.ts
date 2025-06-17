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
  // Check if we have a production API endpoint configured
  const apiEndpoint = process.env.NEXT_PUBLIC_FEEDBACK_API_ENDPOINT;
  
  if (apiEndpoint) {
    // Use API Gateway endpoint
    try {
      const response = await fetch(apiEndpoint, {
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
      return;
    } catch (error) {
      console.error('Error submitting to API:', error);
      // Fall through to localStorage backup
    }
  }
  
  // Fallback to localStorage if no API or if API fails
  try {
    const stored = localStorage.getItem('vtt_feedback') || '[]';
    const feedbackArray = JSON.parse(stored);
    feedbackArray.push(feedback);
    localStorage.setItem('vtt_feedback', JSON.stringify(feedbackArray));
    console.log('Feedback saved to localStorage');
  } catch (error) {
    console.error('Error saving to localStorage:', error);
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