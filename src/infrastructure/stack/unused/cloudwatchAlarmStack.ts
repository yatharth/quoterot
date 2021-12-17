//
// import * as cdk from '@aws-cdk/core';
// import {FilterPattern, LogGroup, MetricFilter, RetentionDays} from "@aws-cdk/aws-logs";
// import * as cloudwatch from "@aws-cdk/aws-cloudwatch";
// import {Topic} from "@aws-cdk/aws-sns";
// import {SnsAction} from "@aws-cdk/aws-cloudwatch-actions";
//
// const appName = 'QuoteRot'
// const logGroupName = 'app-errors'
//
// export class CloudwatchAlarmStack extends cdk.Stack {
//     constructor(scope: cdk.Construct, id: string) {
//         super(scope, id);
//
//         // Create AWS CloudWatch log group for receiving logs.
//         const logGroup = new LogGroup(this, `${appName}-${logGroupName}`, {
//             logGroupName: logGroupName,
//             retention: RetentionDays.INFINITE
//         });
//
//         // Create metric filter for filtering errors.
//         const metricFilter = new MetricFilter(this, `${appName}-${logGroupName}-MetricFilter`, {
//             logGroup,
//             metricNamespace: `${appName}-Errors`,  // XXX: Extract out to a parameter.
//             metricName:  `${appName}-${logGroup}-ErrorCount`,
//             filterPattern: FilterPattern.anyTerm("ERROR", "Error", "error"),
//             metricValue: '1',  // How much to add to the metric every time the filter matches.
//         });
//
//         // Create CloudWatch metric from the metric filter
//         const metric = metricFilter.metric();
//
//         // Create CloudWatch alarm for the metric.
//         const alarm = new cloudwatch.Alarm(this, `${appName}-${logGroup}-AnyErrorAlarm`, {
//             metric,
//             comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
//             threshold: 1,
//             evaluationPeriods: 1,
//             statistic: 'SUM',
//         });
//
//         //Creating an SNS topic for the alarm
//         const snsTopic = new Topic(this, `${appName}-LogFilterTopic`, {
//             displayName: 'app-errors-topic',
//             fifo: false
//         });
//
//         alarm.addAlarmAction(new SnsAction(snsTopic));
//     }
// }