import { randomBytes } from "crypto";

import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

import { VPCResources } from "./vpc";
import { ECSResources } from "./ecs";
import { DistributionResources } from "./distribution";

export interface NextAppStackProps extends cdk.StackProps {
  domainName?: string;
}

export class NextAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: NextAppStackProps) {
    super(scope, id, props);

    const randomString = generateRandomString(12);
    const customHeader = "X-From-CloudFront";

    const vpcResources = new VPCResources(this, "VPCResources");
    const ecsResources = new ECSResources(this, "ECSResources", {
      vpc: vpcResources.vpc,
      applicationLoadBalancerSecurityGroup:
        vpcResources.applicationLoadBalancerSecurityGroup,
      customHeader: customHeader,
      randomString: randomString,
    });

    // CloudFront, even with x-accel-buffering=no response headers from origin, buffers streaming responses
    // the Next.js app. Not finding a lot of help out there with other people trying the CloudFront + ALB setup.
    // leaving it like this for now, going to explore OpenNext in a separate repo.

    // const distribution = new DistributionResources(
    //   this,
    //   "DistributionResources",
    //   {
    //     applicationLoadBalancer: ecsResources.applicationLoadBalancer,
    //     customHeader: customHeader,
    //     randomString: randomString,
    //     domainName: props.domainName,
    //   }
    // );

    // new cdk.CfnOutput(this, "distributionDomain", {
    //   value: distribution.distribution.domainName,
    // });
  }
}

function generateRandomString(length: number): string {
  const randomBytesArray = randomBytes(length);
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = randomBytesArray[i] % charset.length;
    result += charset.charAt(randomIndex);
  }

  return result;
}
