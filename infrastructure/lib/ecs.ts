import { IVpc, SecurityGroup, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import {
  Cluster,
  ContainerImage,
  CpuArchitecture,
  FargateService,
  FargateTaskDefinition,
  LogDrivers,
  OperatingSystemFamily,
} from "aws-cdk-lib/aws-ecs";
import {
  ApplicationLoadBalancer,
  ApplicationProtocol,
  ApplicationTargetGroup,
  ListenerAction,
  ListenerCondition,
  Protocol,
} from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { Construct } from "constructs";

interface ECSResourcesProps {
  vpc: IVpc;
  applicationLoadBalancerSecurityGroup: SecurityGroup;
  customHeader: string;
  randomString: string;
}

export class ECSResources extends Construct {
  fargateService: FargateService;
  applicationLoadBalancer: ApplicationLoadBalancer;

  constructor(scope: Construct, id: string, props: ECSResourcesProps) {
    super(scope, id);

    const cluster = new Cluster(this, "Cluster", {
      vpc: props.vpc,
      clusterName: "nextApp",
    });

    this.applicationLoadBalancer = new ApplicationLoadBalancer(
      this,
      "applicationLoadBalancer",
      {
        vpc: props.vpc,
        vpcSubnets: { subnetType: SubnetType.PUBLIC },
        // vpcSubnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS },
        internetFacing: true,
        // internetFacing: true,
        securityGroup: props.applicationLoadBalancerSecurityGroup,
      }
    );

    const ecsTask = new FargateTaskDefinition(this, "ecsTask", {
      memoryLimitMiB: 2048,
      cpu: 1024,
      runtimePlatform: {
        operatingSystemFamily: OperatingSystemFamily.LINUX,
        cpuArchitecture: CpuArchitecture.X86_64,
      },
    });

    ecsTask.addContainer("NextJsContainer", {
      image: ContainerImage.fromAsset("../app"),
      containerName: "nextApp",
      portMappings: [{ containerPort: 3000, hostPort: 3000 }],
      logging: LogDrivers.awsLogs({
        streamPrefix: "nextApp",
      }),
      environment: {},
    });

    const taskSecurityGroup = new SecurityGroup(this, "taskSecurityGroups", {
      vpc: props.vpc,
    });

    this.fargateService = new FargateService(this, "nextAppFargateService", {
      cluster: cluster,
      taskDefinition: ecsTask,
      assignPublicIp: true,
      // assignPublicIp: true,
      desiredCount: 1,
      vpcSubnets: { subnetType: SubnetType.PUBLIC },
      // vpcSubnets: { subnetType: SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [taskSecurityGroup],
    });

    const scaling = this.fargateService.autoScaleTaskCount({ maxCapacity: 10 });

    scaling.scaleOnCpuUtilization("CpuScaling", {
      targetUtilizationPercent: 50,
    });

    const fargateTargetGroup = new ApplicationTargetGroup(
      this,
      "nextAppTargetGroup",
      {
        vpc: props.vpc,
        port: 3000,
        protocol: ApplicationProtocol.HTTP,
        targets: [this.fargateService],
        healthCheck: {
          path: "/",
          protocol: Protocol.HTTP,
          port: "3000",
        },
      }
    );

    const fargateListener = this.applicationLoadBalancer.addListener(
      "fargateListener",
      {
        port: 80,
        protocol: ApplicationProtocol.HTTP,
        open: true,
        defaultAction: ListenerAction.fixedResponse(403),
        // defaultAction: ListenerAction.forward([fargateTargetGroup]),
      }
    );

    fargateListener.addAction("ForwardFromCloudFront", {
      action: ListenerAction.forward([fargateTargetGroup]),
      conditions: [
        ListenerCondition.httpHeader(props.customHeader, [props.randomString]),
      ],
      priority: 1,
    });
    // fargateListener.addAction("ForwardFromCloudFront", {
    //   action: ListenerAction.forward([fargateTargetGroup]),
    //   conditions: [
    //     ListenerCondition.httpHeader(props.customHeader, [props.randomString]),
    //   ],
    //   priority: 1,
    // });
  }
}
