import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';

export interface VocalTechniqueTranslatorStackProps extends cdk.StackProps {
  domainName: string;
  certificateArn?: string;
  createCertificate?: boolean;
}

export class VocalTechniqueTranslatorStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: VocalTechniqueTranslatorStackProps) {
    super(scope, id, props);

    // Certificate - either use existing or create new
    let certificate: acm.ICertificate | undefined;
    
    if (props.certificateArn) {
      certificate = acm.Certificate.fromCertificateArn(this, 'Certificate', props.certificateArn);
    } else if (props.createCertificate) {
      certificate = new acm.Certificate(this, 'Certificate', {
        domainName: props.domainName,
        subjectAlternativeNames: [`www.${props.domainName}`],
        validation: acm.CertificateValidation.fromDns(),
      });
      
      new cdk.CfnOutput(this, 'CertificateArn', {
        value: certificate.certificateArn,
        description: 'Certificate ARN - Save this for future deployments',
      });
    }

    // S3 bucket for hosting static website
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: `${props.domainName}-website`,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Lambda@Edge function for redirects
    const redirectFunction = new cloudfront.Function(this, 'RedirectFunction', {
      code: cloudfront.FunctionCode.fromInline(`
        function handler(event) {
          var request = event.request;
          var headers = request.headers;
          var host = headers.host.value;
          
          // Redirect CloudFront URL to www domain
          if (host.includes('cloudfront.net')) {
            var response = {
              statusCode: 301,
              statusDescription: 'Moved Permanently',
              headers: {
                location: { value: 'https://www.${props.domainName}' + request.uri }
              }
            };
            return response;
          }
          
          // Redirect non-www to www
          if (host === '${props.domainName}') {
            var response = {
              statusCode: 301,
              statusDescription: 'Moved Permanently',
              headers: {
                location: { value: 'https://www.${props.domainName}' + request.uri }
              }
            };
            return response;
          }
          
          return request;
        }
      `),
      functionName: 'VocalTechniqueTranslatorRedirect',
    });

    // Origin Access Identity for CloudFront
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OAI', {
      comment: 'OAI for Vocal Technique Translator',
    });

    // Grant CloudFront access to S3
    websiteBucket.grantRead(originAccessIdentity);

    // CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket, {
          originAccessIdentity: originAccessIdentity,
        }),
        functionAssociations: [{
          function: redirectFunction,
          eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
        }],
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      domainNames: certificate ? [`www.${props.domainName}`, props.domainName] : undefined,
      certificate: certificate,
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5),
        },
      ],
    });

    // Deploy site contents to S3
    // Check if NextJS build exists, otherwise deploy index.html
    const fs = require('fs');
    const path = require('path');
    const nextBuildPath = path.join(__dirname, '../../out');
    const isNextJSBuild = fs.existsSync(nextBuildPath);
    
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: isNextJSBuild 
        ? [s3deploy.Source.asset('../out')]      // NextJS static export
        : [s3deploy.Source.asset('..', {         // Original index.html
            exclude: ['*', '!index.html'],
          })],
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ['/*'],
    });

    // Outputs
    new cdk.CfnOutput(this, 'DistributionId', {
      value: distribution.distributionId,
      description: 'CloudFront Distribution ID',
    });

    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: distribution.distributionDomainName,
      description: 'CloudFront Distribution Domain Name',
    });

    new cdk.CfnOutput(this, 'BucketName', {
      value: websiteBucket.bucketName,
      description: 'S3 Bucket Name',
    });
  }
}