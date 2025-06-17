import { Amplify } from 'aws-amplify';

const cognitoConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID || '',
      identityPoolId: process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID || '',
      loginWith: {
        oauth: {
          domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN || '',
          scopes: ['email', 'openid', 'profile'],
          redirectSignIn: [
            typeof window !== 'undefined' ? window.location.origin + '/admin/callback' : 'http://localhost:4062/admin/callback'
          ],
          redirectSignOut: [
            typeof window !== 'undefined' ? window.location.origin + '/admin/feedback' : 'http://localhost:4062/admin/feedback'
          ],
          responseType: 'code' as const,
        },
        email: true,
        username: true,
      },
    },
  },
};

// Configure Amplify only on client side
if (typeof window !== 'undefined') {
  Amplify.configure(cognitoConfig);
}

export default cognitoConfig;