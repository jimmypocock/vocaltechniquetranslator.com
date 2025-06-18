import { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';

// Simple feedback storage using S3
// This keeps your infrastructure simple and serverless

interface FeedbackData {
  originalWord: string;
  currentTransformation: string;
  suggestedTransformation: string;
  intensity: number;
  context: string;
  reason?: string;
  timestamp: string;
  id: string;
  userAgent?: string;
  ip?: string;
  submittedAt?: string;
}

export class S3FeedbackStorage {
  private s3Client: S3Client;
  private bucketName: string;
  private region: string;

  constructor() {
    this.bucketName = process.env.FEEDBACK_BUCKET_NAME || 'vtt-feedback';
    this.region = process.env.AWS_REGION || 'us-east-1';
    
    this.s3Client = new S3Client({
      region: this.region,
      // Credentials will be automatically loaded from environment or IAM role
    });
  }

  async saveFeedback(feedback: FeedbackData): Promise<void> {
    // Save each feedback as a JSON file in S3
    // Use a date-based folder structure for organization
    
    const date = new Date(feedback.submittedAt || feedback.timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const key = `feedback/${year}/${month}/${day}/${feedback.id}.json`;
    
    try {
      await this.s3Client.send(new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: JSON.stringify(feedback, null, 2),
        ContentType: 'application/json',
        Metadata: {
          'original-word': feedback.originalWord,
          'intensity': String(feedback.intensity),
          'context': feedback.context,
        }
      }));
      
      console.log(`[S3 Storage] Saved feedback to: s3://${this.bucketName}/${key}`);
    } catch (error) {
      console.error('[S3 Storage] Error saving feedback:', error);
      throw error;
    }
  }

  async listFeedback(startDate?: Date, endDate?: Date): Promise<FeedbackData[]> {
    const feedbackList: FeedbackData[] = [];
    
    try {
      // If we have date filters, construct prefix
      const prefix = 'feedback/';
      if (startDate) {
        // For simplicity, we'll just list all and filter
        // In production, you might want to iterate through date folders
      }
      
      // List all objects in the feedback folder
      let continuationToken: string | undefined;
      
      do {
        const listResponse = await this.s3Client.send(new ListObjectsV2Command({
          Bucket: this.bucketName,
          Prefix: prefix,
          ContinuationToken: continuationToken,
        }));
        
        if (listResponse.Contents) {
          // Fetch each object
          for (const object of listResponse.Contents) {
            if (object.Key && object.Key.endsWith('.json')) {
              try {
                const getResponse = await this.s3Client.send(new GetObjectCommand({
                  Bucket: this.bucketName,
                  Key: object.Key,
                }));
                
                if (getResponse.Body) {
                  const bodyContents = await getResponse.Body.transformToString();
                  const feedback = JSON.parse(bodyContents) as FeedbackData;
                  
                  // Apply date filters if provided
                  const feedbackDate = new Date(feedback.submittedAt || feedback.timestamp);
                  if (startDate && feedbackDate < startDate) continue;
                  if (endDate && feedbackDate > endDate) continue;
                  
                  feedbackList.push(feedback);
                }
              } catch (error) {
                console.error(`[S3 Storage] Error reading ${object.Key}:`, error);
              }
            }
          }
        }
        
        continuationToken = listResponse.NextContinuationToken;
      } while (continuationToken);
      
      // Sort by date, newest first
      feedbackList.sort((a, b) => {
        const dateA = new Date(a.submittedAt || a.timestamp).getTime();
        const dateB = new Date(b.submittedAt || b.timestamp).getTime();
        return dateB - dateA;
      });
      
    } catch (error) {
      console.error('[S3 Storage] Error listing feedback:', error);
      throw error;
    }
    
    return feedbackList;
  }
}

// Alternative: Use a simple webhook to Google Sheets or Airtable
export class WebhookFeedbackStorage {
  private webhookUrl: string;

  constructor() {
    this.webhookUrl = process.env.FEEDBACK_WEBHOOK_URL || '';
  }

  async saveFeedback(feedback: FeedbackData): Promise<void> {
    if (!this.webhookUrl) {
      console.log('[Webhook Storage] No webhook URL configured');
      return;
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...feedback,
          source: 'vocal-technique-translator'
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook returned ${response.status}`);
      }

      console.log('[Webhook Storage] Feedback sent successfully');
    } catch (error) {
      console.error('[Webhook Storage] Error:', error);
      throw error;
    }
  }
}

// Factory function to get the appropriate storage
export function getFeedbackStorage() {
  const storageMethod = process.env.FEEDBACK_STORAGE_METHOD || 'log';
  
  switch (storageMethod) {
    case 's3':
      return new S3FeedbackStorage();
    case 'webhook':
      return new WebhookFeedbackStorage();
    default:
      // Default to console logging
      return {
        async saveFeedback(feedback: FeedbackData) {
          console.log('[Feedback Log]:', JSON.stringify(feedback, null, 2));
        },
        async listFeedback() {
          return [];
        }
      };
  }
}