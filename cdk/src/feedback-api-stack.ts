import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ses from 'aws-cdk-lib/aws-ses';
import { Construct } from 'constructs';
import * as path from 'path';

export interface FeedbackApiStackProps extends cdk.StackProps {
  feedbackBucket: s3.Bucket;
  domainName: string;
  notificationEmail?: string;
}

export class FeedbackApiStack extends cdk.Stack {
  public readonly apiUrl: string;

  constructor(scope: Construct, id: string, props: FeedbackApiStackProps) {
    super(scope, id, props);

    // Create Lambda function for handling feedback
    const feedbackHandler = new lambda.Function(this, 'FeedbackHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        const { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');
        const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
        
        const s3Client = new S3Client({ region: process.env.AWS_REGION });
        const sesClient = new SESClient({ region: process.env.AWS_REGION });
        const bucketName = process.env.FEEDBACK_BUCKET_NAME;
        const adminSecret = process.env.ADMIN_SECRET;
        const notificationEmail = process.env.NOTIFICATION_EMAIL;
        
        exports.handler = async (event) => {
          const headers = {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
          };
          
          // Handle preflight
          if (event.httpMethod === 'OPTIONS') {
            return {
              statusCode: 200,
              headers,
              body: '',
            };
          }
          
          try {
            if (event.httpMethod === 'POST') {
              // Submit feedback
              const feedback = JSON.parse(event.body);
              
              // Add server metadata
              const enrichedFeedback = {
                ...feedback,
                submittedAt: new Date().toISOString(),
                userAgent: event.headers['User-Agent'] || 'unknown',
                ip: event.headers['X-Forwarded-For'] || event.requestContext.identity.sourceIp || 'unknown',
              };
              
              // Save to S3
              const date = new Date();
              const key = \`feedback/\${date.getFullYear()}/\${String(date.getMonth() + 1).padStart(2, '0')}/\${String(date.getDate()).padStart(2, '0')}/\${feedback.id}.json\`;
              
              await s3Client.send(new PutObjectCommand({
                Bucket: bucketName,
                Key: key,
                Body: JSON.stringify(enrichedFeedback, null, 2),
                ContentType: 'application/json',
              }));
              
              // Send email notification if email is configured
              if (notificationEmail) {
                try {
                  const emailBody = \`
New feedback received for Vocal Technique Translator!

📝 Original Word/Phrase:
"\${feedback.originalWord}"

🔄 Current Translation (Intensity \${feedback.intensity}):
"\${feedback.currentTransformation}"

✨ Suggested Improvement:
"\${feedback.suggestedTransformation}"

📍 Context: \${feedback.context}

\${feedback.reason ? \`💭 User's Reasoning:\\n"\${feedback.reason}"\\n\\n\` : ''}📊 Submission Details:
• ID: \${feedback.id}
• Timestamp: \${enrichedFeedback.submittedAt}
• User Agent: \${enrichedFeedback.userAgent}

🔗 View in Admin Panel:
https://www.vocaltechniquetranslator.com/admin/feedback

This feedback has been automatically saved to S3 for analysis.
                  \`;

                  await sesClient.send(new SendEmailCommand({
                    Source: notificationEmail,
                    Destination: {
                      ToAddresses: [notificationEmail],
                    },
                    Message: {
                      Subject: {
                        Data: \`[VTT] New Feedback: "\${feedback.originalWord}" → "\${feedback.suggestedTransformation}"\`,
                        Charset: 'UTF-8',
                      },
                      Body: {
                        Text: {
                          Data: emailBody,
                          Charset: 'UTF-8',
                        },
                      },
                    },
                  }));
                } catch (emailError) {
                  console.error('Failed to send email notification:', emailError);
                  // Don't fail the request if email fails
                }
              }
              
              return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, id: feedback.id }),
              };
              
            } else if (event.httpMethod === 'GET') {
              // Retrieve feedback (admin only)
              const authHeader = event.headers.Authorization || event.headers.authorization;
              if (!authHeader || authHeader !== \`Bearer \${adminSecret}\`) {
                return {
                  statusCode: 401,
                  headers,
                  body: JSON.stringify({ error: 'Unauthorized' }),
                };
              }
              
              // List feedback from S3
              const feedback = [];
              const response = await s3Client.send(new ListObjectsV2Command({
                Bucket: bucketName,
                Prefix: 'feedback/',
              }));
              
              // For simplicity, return just the list of keys
              // In production, you'd want to fetch and parse each file
              return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                  feedback: response.Contents?.map(obj => ({
                    key: obj.Key,
                    lastModified: obj.LastModified,
                    size: obj.Size,
                  })) || [],
                  message: 'Use the key to fetch individual feedback items',
                }),
              };
            }
            
            return {
              statusCode: 405,
              headers,
              body: JSON.stringify({ error: 'Method not allowed' }),
            };
            
          } catch (error) {
            console.error('Error:', error);
            return {
              statusCode: 500,
              headers,
              body: JSON.stringify({ error: 'Internal server error' }),
            };
          }
        };
      `),
      environment: {
        FEEDBACK_BUCKET_NAME: props.feedbackBucket.bucketName,
        ADMIN_SECRET: process.env.FEEDBACK_ADMIN_SECRET || 'change-me-in-production',
        ALLOWED_ORIGIN: `https://www.${props.domainName}`,
        NOTIFICATION_EMAIL: props.notificationEmail || '',
      },
      timeout: cdk.Duration.seconds(30),
    });

    // Grant Lambda permissions to read/write to S3
    props.feedbackBucket.grantReadWrite(feedbackHandler);

    // Grant Lambda permissions to send emails via SES
    feedbackHandler.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'ses:SendEmail',
        'ses:SendRawEmail',
      ],
      resources: ['*'], // SES doesn't support resource-level permissions for sending
    }));

    // Create API Gateway
    const api = new apigateway.RestApi(this, 'FeedbackApi', {
      restApiName: 'VTT Feedback API',
      description: 'API for collecting user feedback',
      defaultCorsPreflightOptions: {
        allowOrigins: [
          `https://www.${props.domainName}`,
          `https://${props.domainName}`,
          'http://localhost:3000',
          'http://localhost:4062',
        ],
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    // Add /feedback resource
    const feedbackResource = api.root.addResource('feedback');
    
    // Add methods
    feedbackResource.addMethod('POST', new apigateway.LambdaIntegration(feedbackHandler));
    feedbackResource.addMethod('GET', new apigateway.LambdaIntegration(feedbackHandler));

    // Store API URL
    this.apiUrl = api.url;

    // Outputs
    new cdk.CfnOutput(this, 'FeedbackApiUrl', {
      value: api.url,
      description: 'URL of the Feedback API',
      exportName: 'VTTFeedbackApiUrl',
    });

    new cdk.CfnOutput(this, 'FeedbackApiEndpoint', {
      value: `${api.url}feedback`,
      description: 'Full endpoint for feedback submission',
    });
  }
}