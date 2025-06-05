import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';

export interface DnsStackProps extends StackProps {
  domainName: string;
  distribution: cloudfront.Distribution;
}

export class DnsStack extends Stack {
  public readonly hostedZone: route53.IHostedZone;

  constructor(scope: Construct, id: string, props: DnsStackProps) {
    super(scope, id, props);

    // Import existing hosted zone
    // Note: You need to have a hosted zone already created in Route 53
    this.hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: props.domainName,
    });

    // Create A record for apex domain (vocaltechniquetranslator.com)
    new route53.ARecord(this, 'ARecord', {
      zone: this.hostedZone,
      recordName: props.domainName,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(props.distribution)
      ),
      comment: 'A record for apex domain pointing to CloudFront'
    });

    // Create AAAA record for apex domain (IPv6)
    new route53.AaaaRecord(this, 'AaaaRecord', {
      zone: this.hostedZone,
      recordName: props.domainName,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(props.distribution)
      ),
      comment: 'AAAA record for apex domain pointing to CloudFront (IPv6)'
    });

    // Create A record for www subdomain
    new route53.ARecord(this, 'WwwARecord', {
      zone: this.hostedZone,
      recordName: `www.${props.domainName}`,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(props.distribution)
      ),
      comment: 'A record for www subdomain pointing to CloudFront'
    });

    // Create AAAA record for www subdomain (IPv6)
    new route53.AaaaRecord(this, 'WwwAaaaRecord', {
      zone: this.hostedZone,
      recordName: `www.${props.domainName}`,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(props.distribution)
      ),
      comment: 'AAAA record for www subdomain pointing to CloudFront (IPv6)'
    });

    // Outputs
    new CfnOutput(this, 'HostedZoneId', {
      value: this.hostedZone.hostedZoneId,
      description: 'Route 53 Hosted Zone ID',
      exportName: `${this.stackName}-HostedZoneId`,
    });

    new CfnOutput(this, 'NameServers', {
      value: this.hostedZone.hostedZoneNameServers?.join(', ') || 'N/A',
      description: 'Route 53 Name Servers',
    });
  }
}