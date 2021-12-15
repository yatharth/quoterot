import {Construct} from '@aws-cdk/core'
import {Function as lambdaFunction} from '@aws-cdk/aws-lambda/lib/function'
import {NodejsFunction, NodejsFunctionProps} from '@aws-cdk/aws-lambda-nodejs'
import {Runtime} from '@aws-cdk/aws-lambda'
import {Queue} from '@aws-cdk/aws-sqs'
import {SqsEventSource} from '@aws-cdk/aws-lambda-event-sources'

interface StringValued {
    [key: string]: string;
}

export function makeLambda<LambdaEnvironment extends StringValued = {}>
(scope: Construct, id: string, filename: string, environment: LambdaEnvironment, props: NodejsFunctionProps = {}): lambdaFunction {

    const defaultProps: NodejsFunctionProps = {
        runtime: Runtime.NODEJS_14_X,

        // XXX: What is the difference between `code:` and `entry:`?
        // code: Code.asset('./handlers/publish'),
        // code: lambda.Code.fromAsset('src'),
        // handler: 'index.handler',

        // XXX: Look into these options. Do they save me money or something?
        // memorySize: 1024,
        // timeout: cdk.Duration.seconds(5),

        // Don’t need this; the default is fine: `handler`.
        // handler: 'main',

        // Don’t need this; the default bundling options are this by default.
        // https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-lambda-nodejs.NodejsFunction.html#bundling
        // bundling: { externalModules: ['aws-sdk'], },

        // Don’t need this.
        // depsLockFilePath: 'path/to/package-lock.json',
    }

    return new NodejsFunction(scope, id, {
        ...defaultProps,
        entry: filename,
        environment,
        ...props,
    })

}

export function subscribeLambdaToQueue(lambda: lambdaFunction, queue: Queue) {
    // TODO: Consider maxxing batching variables.
    // TODO: Increase batch size from 1?
    lambda.addEventSource(
        new SqsEventSource(queue, {
            // https://docs.aws.amazon.com/cdk/api/latest/docs/aws-lambda-event-sources-readme.html
            // maxBatchingWindow:
            batchSize: 1,
        }),
    )
}
