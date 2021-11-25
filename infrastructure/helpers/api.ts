import {Construct} from '@aws-cdk/core'
import {LambdaIntegration} from '@aws-cdk/aws-apigateway'
import {IResource} from '@aws-cdk/aws-apigateway/lib/resource'
import {NodejsFunction, NodejsFunctionProps} from '@aws-cdk/aws-lambda-nodejs'
import {Runtime, Function as lambdaFunction} from '@aws-cdk/aws-lambda'
import {addCorsOptions} from './cors'
import {Queue} from '@aws-cdk/aws-sqs'
import * as eventSources from '@aws-cdk/aws-lambda-event-sources'

export function addResourceWithCors(parentResource: IResource, pathPart: string) {
    const childResource = parentResource.addResource(pathPart)
    addCorsOptions(childResource)
    return childResource
}

export function makeLambdaAndIntegration(scope: Construct, id: string, filename: string):
    [lambdaFunction, LambdaIntegration] {

    const nodeJsFunctionProps: NodejsFunctionProps = {
        runtime: Runtime.NODEJS_14_X,

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

    const lambda = new NodejsFunction(scope, id, {entry: filename, ...nodeJsFunctionProps})
    const lambdaIntegration = new LambdaIntegration(lambda)
    return [lambda, lambdaIntegration]
}

export function connectLambdaToQueue(lambda: lambdaFunction, queue: Queue, batchSize: number) {
    lambda.addEventSource(
        new eventSources.SqsEventSource(queue, {
            // maxBatchingWindow:
            batchSize,
        }),
    )
}