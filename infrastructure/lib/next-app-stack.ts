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

    const distribution = new DistributionResources(
      this,
      "DistributionResources",
      {
        applicationLoadBalancer: ecsResources.applicationLoadBalancer,
        customHeader: customHeader,
        randomString: randomString,
        domainName: props.domainName,
      }
    );

    new cdk.CfnOutput(this, "distributionDomain", {
      value: distribution.distribution.domainName,
    });
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
