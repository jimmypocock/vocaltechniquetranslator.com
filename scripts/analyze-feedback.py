#!/usr/bin/env python3

"""
Analyze and Export Feedback from S3
This script provides comprehensive analysis of feedback data
"""

import json
import csv
import boto3
import pandas as pd
from datetime import datetime
from collections import Counter, defaultdict
import argparse
import os
import sys

def get_feedback_bucket_name():
    """Get bucket name from CloudFormation or environment"""
    bucket_name = os.environ.get('FEEDBACK_BUCKET_NAME')
    
    if not bucket_name:
        try:
            cf = boto3.client('cloudformation')
            response = cf.describe_stacks(StackName='VTT-Feedback')
            outputs = response['Stacks'][0]['Outputs']
            for output in outputs:
                if output['OutputKey'] == 'FeedbackBucketName':
                    bucket_name = output['OutputValue']
                    break
        except:
            pass
    
    return bucket_name

def download_feedback_from_s3(bucket_name):
    """Download all feedback JSON files from S3"""
    s3 = boto3.client('s3')
    feedback_list = []
    
    print(f"📥 Downloading feedback from s3://{bucket_name}/feedback/")
    
    try:
        paginator = s3.get_paginator('list_objects_v2')
        pages = paginator.paginate(Bucket=bucket_name, Prefix='feedback/')
        
        for page in pages:
            if 'Contents' in page:
                for obj in page['Contents']:
                    if obj['Key'].endswith('.json'):
                        try:
                            response = s3.get_object(Bucket=bucket_name, Key=obj['Key'])
                            content = response['Body'].read().decode('utf-8')
                            feedback = json.loads(content)
                            feedback_list.append(feedback)
                        except Exception as e:
                            print(f"⚠️  Error reading {obj['Key']}: {e}")
    
    except Exception as e:
        print(f"❌ Error accessing S3: {e}")
        sys.exit(1)
    
    return feedback_list

def analyze_feedback(feedback_list):
    """Analyze feedback patterns and statistics"""
    if not feedback_list:
        print("No feedback to analyze")
        return
    
    print(f"\n📊 Feedback Analysis")
    print(f"{'='*50}")
    print(f"Total feedback items: {len(feedback_list)}")
    
    # Convert to DataFrame for easier analysis
    df = pd.DataFrame(feedback_list)
    
    # Time range
    if 'submittedAt' in df.columns:
        df['timestamp_parsed'] = pd.to_datetime(df['submittedAt'])
        print(f"Date range: {df['timestamp_parsed'].min()} to {df['timestamp_parsed'].max()}")
    
    # Intensity distribution
    if 'intensity' in df.columns:
        print(f"\n📈 Intensity Distribution:")
        intensity_counts = df['intensity'].value_counts().sort_index()
        for intensity, count in intensity_counts.items():
            print(f"  Level {intensity}: {count} ({count/len(df)*100:.1f}%)")
    
    # Most common words needing feedback
    if 'originalWord' in df.columns:
        print(f"\n🔤 Top 10 Words with Feedback:")
        word_counts = df['originalWord'].str.lower().value_counts().head(10)
        for word, count in word_counts.items():
            print(f"  '{word}': {count} times")
    
    # Context distribution
    if 'context' in df.columns:
        print(f"\n🎯 Context Distribution:")
        context_counts = df['context'].value_counts()
        for context, count in context_counts.items():
            print(f"  {context}: {count}")
    
    # Common transformation patterns
    if 'currentTransformation' in df.columns and 'suggestedTransformation' in df.columns:
        print(f"\n🔄 Common Transformation Patterns:")
        transformations = df.groupby(['currentTransformation', 'suggestedTransformation']).size().sort_values(ascending=False).head(10)
        for (current, suggested), count in transformations.items():
            print(f"  '{current}' → '{suggested}': {count} times")
    
    # Words with multiple different suggestions
    if 'originalWord' in df.columns and 'suggestedTransformation' in df.columns:
        print(f"\n🤔 Words with Multiple Different Suggestions:")
        word_suggestions = defaultdict(set)
        for _, row in df.iterrows():
            word_suggestions[row['originalWord'].lower()].add(row['suggestedTransformation'])
        
        multi_suggestions = [(word, suggestions) for word, suggestions in word_suggestions.items() if len(suggestions) > 1]
        multi_suggestions.sort(key=lambda x: len(x[1]), reverse=True)
        
        for word, suggestions in multi_suggestions[:5]:
            print(f"  '{word}': {list(suggestions)}")

def export_to_csv(feedback_list, output_dir):
    """Export feedback to CSV file"""
    if not feedback_list:
        print("No feedback to export")
        return None
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    csv_filename = os.path.join(output_dir, f"feedback_export_{timestamp}.csv")
    
    # Define CSV columns
    fieldnames = [
        'timestamp', 'submittedAt', 'originalWord', 'currentTransformation',
        'suggestedTransformation', 'intensity', 'context', 'reason',
        'id', 'userAgent', 'ip'
    ]
    
    with open(csv_filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames, extrasaction='ignore')
        writer.writeheader()
        
        for feedback in feedback_list:
            # Ensure timestamp field exists
            if 'timestamp' not in feedback and 'submittedAt' in feedback:
                feedback['timestamp'] = feedback['submittedAt']
            writer.writerow(feedback)
    
    return csv_filename

def export_to_json(feedback_list, output_dir):
    """Export feedback to JSON file"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    json_filename = os.path.join(output_dir, f"feedback_export_{timestamp}.json")
    
    with open(json_filename, 'w', encoding='utf-8') as jsonfile:
        json.dump(feedback_list, jsonfile, indent=2, ensure_ascii=False)
    
    return json_filename

def main():
    parser = argparse.ArgumentParser(description='Export and analyze feedback from S3')
    parser.add_argument('--bucket', help='S3 bucket name (otherwise auto-detected)')
    parser.add_argument('--output-dir', default='feedback-exports', help='Output directory')
    parser.add_argument('--analyze', action='store_true', help='Show analysis')
    parser.add_argument('--format', choices=['csv', 'json', 'both'], default='both', help='Export format')
    
    args = parser.parse_args()
    
    # Get bucket name
    bucket_name = args.bucket or get_feedback_bucket_name()
    if not bucket_name:
        print("❌ Could not determine bucket name. Please provide --bucket or set FEEDBACK_BUCKET_NAME")
        sys.exit(1)
    
    # Create output directory
    output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), args.output_dir)
    os.makedirs(output_dir, exist_ok=True)
    
    # Download feedback
    feedback_list = download_feedback_from_s3(bucket_name)
    print(f"✅ Downloaded {len(feedback_list)} feedback items")
    
    if not feedback_list:
        print("No feedback found in bucket")
        return
    
    # Analyze if requested
    if args.analyze:
        analyze_feedback(feedback_list)
    
    # Export files
    files_created = []
    
    if args.format in ['csv', 'both']:
        csv_file = export_to_csv(feedback_list, output_dir)
        if csv_file:
            files_created.append(csv_file)
            print(f"📄 Created CSV: {csv_file}")
    
    if args.format in ['json', 'both']:
        json_file = export_to_json(feedback_list, output_dir)
        if json_file:
            files_created.append(json_file)
            print(f"📄 Created JSON: {json_file}")
    
    print(f"\n✅ Export complete!")
    print(f"📁 Files saved to: {output_dir}")
    
    # Open directory on macOS
    if sys.platform == 'darwin' and files_created:
        os.system(f'open "{output_dir}"')

if __name__ == '__main__':
    main()