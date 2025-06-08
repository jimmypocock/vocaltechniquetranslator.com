import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

interface CognitoStackProps extends cdk.StackProps {
  domainName: string;
  environment: string;
}

export class CognitoStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly identityPool: cognito.CfnIdentityPool;

  constructor(scope: Construct, id: string, props: CognitoStackProps) {
    super(scope, id, props);

    // Create Cognito User Pool for admin authentication
    this.userPool = new cognito.UserPool(this, 'VTTAdminUserPool', {
      userPoolName: `vtt-admin-${props.environment}`,
      signInAliases: {
        email: true,
        username: true,
      },
      selfSignUpEnabled: false, // Only admin can create accounts
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: props.environment === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    // Create User Pool Client
    this.userPoolClient = new cognito.UserPoolClient(this, 'VTTAdminUserPoolClient', {
      userPool: this.userPool,
      userPoolClientName: `vtt-admin-client-${props.environment}`,
      generateSecret: false, // Required for web apps
      authFlows: {
        userSrp: true,
        userPassword: true,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.PROFILE,
        ],
        callbackUrls: [
          `https://www.${props.domainName}/admin/callback`,
          'http://localhost:4062/admin/callback', // For local development
        ],
        logoutUrls: [
          `https://www.${props.domainName}/admin/feedback`,
          'http://localhost:4062/admin/feedback',
        ],
      },
      preventUserExistenceErrors: true,
    });

    // Create Identity Pool for AWS resource access
    this.identityPool = new cognito.CfnIdentityPool(this, 'VTTAdminIdentityPool', {
      identityPoolName: `vtt_admin_${props.environment}`,
      allowUnauthenticatedIdentities: false,
      cognitoIdentityProviders: [
        {
          clientId: this.userPoolClient.userPoolClientId,
          providerName: this.userPool.userPoolProviderName,
        },
      ],
    });

    // Output important values
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
      description: 'Cognito User Pool ID',
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
    });

    new cdk.CfnOutput(this, 'IdentityPoolId', {
      value: this.identityPool.ref,
      description: 'Cognito Identity Pool ID',
    });

    new cdk.CfnOutput(this, 'CognitoHostedUIURL', {
      value: `https://${this.userPool.userPoolId}.auth.${this.region}.amazoncognito.com/login?client_id=${this.userPoolClient.userPoolClientId}&response_type=code&scope=email+openid+profile&redirect_uri=https://www.${props.domainName}/admin/callback`,
      description: 'Cognito Hosted UI Login URL',
    });
  }
}