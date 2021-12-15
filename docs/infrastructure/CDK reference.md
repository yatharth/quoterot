# Lambdas

Handlers can be synchronous or async.

If async, return a promise if you want it to wait for pending stuff, or await those promises yourself. If synchronous handler, then anything on the event loop will be waited for automatically, though avoid this and just use async handlers to be safe. [Source](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-handler.html).

AWS seems to do some nice tree-shaking for us with the lambda functions; only the dependencies used are included in the bundle. `aws-sdk` gets included automatically remotely, but doesn’t hurt to include in our `package.json`.



# Lambda destinations

```typescript
import {SnsDestination} from '@aws-cdk/aws-lambda-destinations'

const myLambda = makeLambda<MyLambdaEnvironment>(this, 'myLambda', myLambdaFilename, myLambdaEnvironment, {
    onSuccess: new SnsDestination(myTopic),
})
````

You have to be careful with Lambda Destinations. The lambda invocation could be one of three kinds: synchronous (push), async (event), or stream (poll-based) kind ([docs](https://aws.amazon.com/blogs/architecture/understanding-the-different-ways-to-invoke-lambda-functions/)). 

Invocations from SQS are of the stream kind. But you can only set a destination for stream-based invocations that come from Kinesis or DynamoDB, not SQS. So ultimately, you can’t have SQS-triggered invocations trigger a Lambda Destination. There’s [other users](https://stackoverflow.com/questions/59669947/aws-lambda-w-sqs-trigger-sqs-lambda-destinations-never-adds-to-destination-qu) made about this.

Instead, you could have SNS asynchronously invoke the lambda, as in [this tutorial](https://medium.com/@ifbb324/aws-lambda-destinations-to-notify-failure-using-sqs-sns-8398fde36b9e). SNS subscriptions to lambdas cost nothing (except outbound data transfer), so might be worth replacing the SQS with SNS. But be warned that SNS calls the lambdas for each event; it doesn’t batch them like SQS does. So it’s not appropriate if you want batching; that’s really SQS’ job.

There’s a fun “[What we learned the hard way](https://www.trek10.com/blog/lambda-destinations-what-we-learned-the-hard-way)” article covering this gotcha. Ultimately, you’re kinda fucked if you want to use Lambda Destinations to record failed invocations triggered by SQS.

You could have SQS batch, then send to SNS, which sends to the lambda. It’s kinda crazy, but maybe this works. But then do note that you can’t use SQS’s dead letter queue feature. Maybe SNS has a retry option available! But your lambda destination might have to ultimately parse the response parameters (yuck) and store them if you later want a record of them.

At this point, if all I want is notifications of lambda errors, it may just be easier to create a CloudWatch alarm. Sure, they don’t include the lambda invocation payload and such by default, but could have a try/catch in the lambda that makes sure to print this information?

Remember also that you can’t “push” from SQS to SNS to send error emails. Only lambdas can pull from them. 



# SQS queues

```typescript
import * as sqs from '@aws-cdk/aws-sqs'

const myDeadLetterQueue = new sqs.Queue(this, 'myDeadLetterQueue', {
    retentionPeriod: cdk.Duration.minutes(30),  // By default, 4 days.
})

const myQueue = new sqs.Queue(this, 'myQueue', {
    queueName: "My Queue",
    deadLetterQueue: {
        queue: myDLQ,
        maxReceiveCount: 2,
    },
})
```

Keep in mind the [visibility timeout](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html) should be appropriate for how long your Lambdas take to run.

Also keep in mind the `maxReceiveCount` for DLQs.

Note about retention period for DLQs:

> The expiration of a message is always based on its original enqueue timestamp. When a message is moved to a dead-letter queue, the enqueue timestamp is unchanged. The ApproximateAgeOfOldestMessage metric indicates when the message moved to the dead-letter queue, not when the message was originally sent. For example, assume that a message spends 1 day in the original queue before it's moved to a dead-letter queue. If the dead-letter queue's retention period is 4 days, the message is deleted from the dead-letter queue after 3 days and the ApproximateAgeOfOldestMessage is 3 days. Thus, it is a best practice to always set the retention period of a dead-letter queue to be longer than the retention period of the original queue. ([source](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/working-with-messages.html)))

To batch messages for Lambda consumption more, consider changing `batchSize` and `maxBatchingWindow`.

> By default, Lambda polls up to 10 messages in your queue at once and sends that batch to your function. To avoid invoking the function with a small number of records, you can tell the event source to buffer records for up to 5 minutes by configuring a batch window. Before invoking the function, Lambda continues to poll messages from the SQS standard queue until the batch window expires, the invocation payload size quota is reached, or the configured maximum batch size is reached. ([source](https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html))

Apparently rate limiting lambda consumption of SQS queues [doesn’t work too well](https://zaccharles.medium.com/lambda-concurrency-limits-and-sqs-triggers-dont-mix-well-sometimes-eb23d90122e0).

When you process messages as a batch, you can report success/failure at the record level. There are many approaches; some people delete the successful messages from the queue at the end of the function if not everything succeeded. Others return success, but reinsert the failed records. Amazon also released functionality to report partial success [directly](https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html#services-sqs-batchfailurereporting). You can read more [here](https://lumigo.io/blog/sqs-and-lambda-the-missing-guide-on-failure-modes/).


# SNS topics

```typescript
import {Topic} from '@aws-cdk/aws-sns'
import {SqsSubscription, EmailSubscription, SmsSubscription} from '@aws-cdk/aws-sns-subscriptions'

// Create SNS topic.
const myTopic = new Topic(this, 'myTopic')

// Push messages to queues, email, SMS, etc. 
// https://docs.aws.amazon.com/cdk/api/latest/docs/aws-sns-subscriptions-readme.html
myTopic.addSubscription(new snsSubs.SqsSubscription(myQueue))
myTopic.addSubscription(new EmailSubscription('foo@bar.com'));
myTopic.addSubscription(new SmsSubscription('+15551231234'));
```

For email subscriptions, Amazon will email you to confirm your subscription to the topic first. You won’t get any messages delivered in the meantime.

You could add an SMS subscription, but this is more difficult. You have to make sure you’re not in the SMS Sandbox for SNS, and have created an Originating Identity in Amazon Pinpoint. You can get a toll-free number for $2/mo [here](https://console.aws.amazon.com/pinpoint/home?region=us-east-1#/sms-account-settings/requestLongCode). 


