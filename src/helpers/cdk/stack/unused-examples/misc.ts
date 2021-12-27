


// // Topic to send emails on errors (not used right now).
// const errorsTopic = new Topic(this, 'errorsTopic')
// errorsTopic.addSubscription(new EmailSubscription('yatharth999@gmail.com'))


// const getAllLambda = makeLambda(this, 'getAllIntegration', join(lambdasDir, 'get-all.ts'), {})
// const getOneLambda = makeLambda(this, 'getOneIntegration', join(lambdasDir, 'get-one.ts'),{})
// const apiItems = addEndpoint(api.root, 'items')
// addLambdaHandler(apiItems, 'GET', getAllLambda)
// const apiItemsId = addEndpoint(apiItems, '{id}')
// addLambdaHandler(apiItemsId,'GET', getOneLambda)

// XXX: create explicit CDK CFN output with the API Gateway endpoint (right now, implicitly included).

// const cloudwatchDashboardURL = `https://${Aws.REGION}.console.aws.amazon.com/cloudwatch/home?region=${Aws.REGION}#dashboards:name=${props.dashboardName}`;
// new CfnOutput(this, 'DashboardOutput', {
//     value: cloudwatchDashboardURL,
//     description: 'URL of Sample CloudWatch Dashboard',
//     exportName: 'SampleCloudWatchDashboardURL'
// });

// https://sanderknape.com/2019/05/building-serverless-applications-aws-cdk/
// import { Table, AttributeType } from '@aws-cdk/aws-dynamodb';
// const table = new Table(this, 'table', {
//     partitionKey: { name: 'id', type: AttributeType.Number }
// });
// table.grant(subscribeFunction, "dynamodb:PutItem");

// In environment of subscribwFunction:
// TABLE_NAME: table.tableName

// const aws = require('aws-sdk');
// const dynamodb = new aws.DynamoDB();
//
// exports.handler = async (event) => {
//     for (const record of event.Records) {
//         const id = record.body;
//         console.log(id);
//
//         const params = {
//             TableName: process.env.TABLE_NAME,
//             Item: {
//                 "id": {
//                     N: id
//                 }
//             }
//         }
//
//         await dynamodb.putItem(params).promise();
//     }
//
//     return;
// }

// const [publishFunction, publishIntegration] = makeLambda(this, 'publishToQueue', join(lambdasDir, "publish-to-queue.ts"), {
//     QUEUE_URL: tweetsToArchiveQueue.queueUrl,
// })

// tweetsToArchiveQueue.grantSendMessages(publishFunction);
//
// const apiPublish = addEndpoint(api.root, 'publish')
// apiPublish.addMethod('GET', publishIntegration)