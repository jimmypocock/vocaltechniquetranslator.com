# Feedback API Route

This Next.js API route is disabled because the project uses `output: 'export'` for static site generation, which is incompatible with API routes.

## Current Setup

Instead of using this API route, the feedback system uses:
- **AWS API Gateway** + **Lambda** for the backend
- Deployed separately using CDK scripts

## To Use the Feedback System

1. Deploy the feedback infrastructure:
   ```bash
   ./scripts/deploy-feedback-with-email.sh
   ```

2. Add the API endpoint to your `.env`:
   ```
   NEXT_PUBLIC_FEEDBACK_API_ENDPOINT=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/feedback
   ```

3. The client code will automatically use the API Gateway endpoint when configured.

## If You Want to Use This Route

To enable this Next.js API route, you would need to:
1. Change `next.config.ts` to remove `output: 'export'`
2. Deploy to a platform that supports server-side functions (Vercel, AWS Amplify, etc.)
3. Rename `route.ts.disabled-for-static-export` back to `route.ts`