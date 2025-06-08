import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class FeedbackStack extends cdk.Stack {
  public readonly feedbackBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create S3 bucket for feedback storage
    this.feedbackBucket = new s3.Bucket(this, 'FeedbackBucket', {
      bucketName: `vtt-feedback-${this.account}-${this.region}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: false,
      lifecycleRules: [
        {
          id: 'delete-old-feedback',
          enabled: true,
          transitions: [
            {
              storageClass: s3.StorageClass.INFREQUENT_ACCESS,
              transitionAfter: cdk.Duration.days(30),
            },
            {
              storageClass: s3.StorageClass.GLACIER,
              transitionAfter: cdk.Duration.days(90),
            },
          ],
          expiration: cdk.Duration.days(365), // Keep feedback for 1 year
        },
      ],
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST],
          allowedOrigins: ['*'], // Restrict this to your domain in production
          allowedHeaders: ['*'],
          maxAge: 3000,
        },
      ],
    });

    // Output the bucket name
    new cdk.CfnOutput(this, 'FeedbackBucketName', {
      value: this.feedbackBucket.bucketName,
      description: 'Name of the S3 bucket for feedback storage',
      exportName: 'VTTFeedbackBucketName',
    });

    // Output the bucket ARN
    new cdk.CfnOutput(this, 'FeedbackBucketArn', {
      value: this.feedbackBucket.bucketArn,
      description: 'ARN of the S3 bucket for feedback storage',
      exportName: 'VTTFeedbackBucketArn',
    });
  }
}