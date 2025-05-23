#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VocalTechniqueTranslatorStack } from './vocal-technique-translator-stack';

const app = new cdk.App();

const domainName = 'vocaltechniquetranslator.com';

// Check if we should create a new certificate or use an existing one
const certificateArn = app.node.tryGetContext('certificateArn');
const createCertificate = app.node.tryGetContext('createCertificate') === 'true';

new VocalTechniqueTranslatorStack(app, 'VocalTechniqueTranslatorStack', {
  domainName: domainName,
  certificateArn: certificateArn,
  createCertificate: !certificateArn && createCertificate,
  env: {
    // CloudFront requires us-east-1 for certificates
    region: 'us-east-1',
    account: process.env.CDK_DEFAULT_ACCOUNT,
  },
  description: 'Infrastructure for Vocal Technique Translator website',
});