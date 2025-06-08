# Feedback Collection Setup Guide

This guide explains how to set up centralized feedback collection for the Vocal Technique Translator.

## Option 1: Google Sheets (Recommended for Quick Setup)

This is the easiest way to collect feedback without setting up a database.

### Step 1: Create a Google Sheet

1. Create a new Google Sheet
2. Add these column headers in row 1:
   - A1: `Timestamp`
   - B1: `Original`
   - C1: `Current`
   - D1: `Suggested`
   - E1: `Intensity`
   - F1: `Context`
   - G1: `Reason`
   - H1: `ID`
   - I1: `User Agent`
   - J1: `IP`

### Step 2: Create a Google Apps Script Web App

1. In your Google Sheet, go to Extensions → Apps Script
2. Replace the default code with:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    // Add row to sheet
    sheet.appendRow([
      data.submittedAt || new Date().toISOString(),
      data.originalWord,
      data.currentTransformation,
      data.suggestedTransformation,
      data.intensity,
      data.context,
      data.reason || '',
      data.id,
      data.userAgent || '',
      data.ip || ''
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. Click "Deploy" → "New Deployment"
4. Choose "Web app" as the type
5. Set:
   - Execute as: "Me"
   - Who has access: "Anyone"
6. Click "Deploy" and copy the Web app URL

### Step 3: Update Your Environment Variables

Add to your `.env` file:

```
FEEDBACK_STORAGE_METHOD=webhook
FEEDBACK_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

## Option 2: AWS S3 (For AWS Infrastructure)

If you prefer to keep everything in AWS:

### Step 1: Create an S3 Bucket

```bash
aws s3 mb s3://vtt-feedback-YOUR_UNIQUE_ID
```

### Step 2: Update Your Environment Variables

```
FEEDBACK_STORAGE_METHOD=s3
FEEDBACK_BUCKET_NAME=vtt-feedback-YOUR_UNIQUE_ID
AWS_REGION=us-east-1
```

### Step 3: Add AWS SDK

```bash
npm install @aws-sdk/client-s3
```

### Step 4: Update IAM Permissions

Ensure your Lambda function (if using AWS deployment) has permissions to write to the S3 bucket.

## Option 3: Airtable (For Better UI)

1. Create an Airtable base with similar fields
2. Use Airtable's API to create records
3. Get your API key and base ID from Airtable
4. Update the webhook storage to use Airtable's API format

## Option 4: CloudWatch Logs (Simplest)

If you're deploying to AWS, feedback is automatically logged to CloudWatch. You can:

1. View logs in AWS CloudWatch console
2. Set up CloudWatch Insights queries to analyze feedback
3. Export logs periodically for analysis

### CloudWatch Insights Query Example

```
fields @timestamp, @message
| filter @message like /\[Feedback Received\]/
| parse @message /"originalWord":"(?<original>[^"]+)"/
| parse @message /"suggestedTransformation":"(?<suggested>[^"]+)"/
| parse @message /"intensity":(?<intensity>\d+)/
| sort @timestamp desc
```

## Testing Your Setup

1. Submit test feedback through the UI
2. Check your chosen storage location:
   - Google Sheets: Refresh the sheet
   - S3: Check the bucket in AWS Console
   - CloudWatch: Check logs in AWS Console
   - Airtable: Check your base

## Security Considerations

- For Google Sheets: The web app URL is public but obscure
- For production: Consider adding additional authentication
- Never commit webhook URLs or API keys to git
- Use environment variables for all sensitive configuration

## Analyzing Feedback

Once you're collecting feedback, you can:

1. Export to CSV for analysis
2. Look for patterns in suggestions
3. Identify frequently requested transformations
4. Use the data to improve your exception dictionary

## Next Steps

1. Set up one of the storage methods above
2. Deploy your application with the new environment variables
3. Start collecting real user feedback
4. Use the `/admin/feedback` page to monitor submissions (for local storage)
5. Regularly export and analyze the data to improve translations