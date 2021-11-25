import {join} from 'path'

import * as sns from '@aws-cdk/aws-sns'
import * as subs from '@aws-cdk/aws-sns-subscriptions'
import * as sqs from '@aws-cdk/aws-sqs'
import * as cdk from '@aws-cdk/core'

import {addResourceWithCors, connectLambdaToQueue, makeLambdaAndIntegration} from './helpers/api'
import {RestApi} from '@aws-cdk/aws-apigateway'


export class QuoteRotStack extends cdk.Stack {
    constructor(app: cdk.App, id: string) {
        super(app, id)

        // Dead letter queue to hold tweets that we failed to archive.
        const tweetsToArchiveDeadLetterQueue = new sqs.Queue(this, 'tweetsToArchiveDeadLetterQueue', {
            retentionPeriod: cdk.Duration.minutes(30),
        })

        // SQS queue to hold quoted tweet URLs waiting to be archived.
        const tweetsToArchiveQueue = new sqs.Queue(this, 'tweetsToArchiveQueue', {
            deadLetterQueue: {
                queue: tweetsToArchiveDeadLetterQueue,
                maxReceiveCount: 2,
            },
        })

        // Create an SNS topic, which lets us put test messages in the SQS queue using the AWS CLI easily.
        const tweetsToArchiveTopic = new sns.Topic(this, 'tweetsToArchiveTopic')
        tweetsToArchiveTopic.addSubscription(new subs.SqsSubscription(tweetsToArchiveQueue))

        // Have CDK print out this ARN when it’s done deploying.
        new cdk.CfnOutput(this, 'tweetsToArchiveTopicArn', {value: tweetsToArchiveTopic.topicArn})

        const lambdasDir = join(__dirname, 'lambdas')

        const [archiveTweetsLambda] = makeLambdaAndIntegration(this, 'archiveTweets', join(lambdasDir, 'archive-tweets.ts'))
        const [archiveTweetsDeadLetterLambda] = makeLambdaAndIntegration(this, 'archiveTweetsDeadLetter', join(lambdasDir, 'archive-tweets-dead-letter.ts'))
        connectLambdaToQueue(archiveTweetsLambda, tweetsToArchiveQueue, 10)
        connectLambdaToQueue(archiveTweetsDeadLetterLambda, tweetsToArchiveDeadLetterQueue, 10)

        const [, getAllIntegration] = makeLambdaAndIntegration(this, 'getAllIntegration', join(lambdasDir, 'get-all.ts'))
        const [, getOneIntegration] = makeLambdaAndIntegration(this, 'getOneIntegration', join(lambdasDir, 'get-one.ts'))

        const api = new RestApi(this, 'QuoteRotApi', {restApiName: "Quote Rot API"})
        const apiItems = addResourceWithCors(api.root, 'items')
        apiItems.addMethod('GET', getAllIntegration)
        const apiItemsId = addResourceWithCors(apiItems, '{id}')
        apiItemsId.addMethod('GET', getOneIntegration)
        // TODO: create explicit CDK CFN output with the API Gateway endpoint (right now, implicitly included).

        // const cloudwatchDashboardURL = `https://${Aws.REGION}.console.aws.amazon.com/cloudwatch/home?region=${Aws.REGION}#dashboards:name=${props.dashboardName}`;
        // new CfnOutput(this, 'DashboardOutput', {
        //     value: cloudwatchDashboardURL,
        //     description: 'URL of Sample CloudWatch Dashboard',
        //     exportName: 'SampleCloudWatchDashboardURL'
        // });

    }
}

const app = new cdk.App()
new QuoteRotStack(app, 'QuoteRotStack')
app.synth()
