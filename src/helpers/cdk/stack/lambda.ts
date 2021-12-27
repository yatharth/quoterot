import {Construct} from '@aws-cdk/core'
import {Function, Runtime, Tracing} from '@aws-cdk/aws-lambda'
import {NodejsFunction, NodejsFunctionProps} from '@aws-cdk/aws-lambda-nodejs'

import {StringValued} from '../../typescript/maps'


export function makeLambda<LambdaEnvironment extends StringValued = {}>
(scope: Construct, id: string, filename: string, environment: LambdaEnvironment, props: NodejsFunctionProps = {}): Function {

    const defaultProps: NodejsFunctionProps = {
        runtime: Runtime.NODEJS_14_X,

        // This enables X-Ray tracing, which our error monitoring solution Dashbird uses to show better error messages.
        //  https://dashbird.io/docs/quickstart/enable-x-ray/
        // XXX: To take full advantage of this, I do need to wrap AWS calls with the AWS X-Ray wrapper:
        //  https://docs.aws.amazon.com/lambda/latest/dg/nodejs-tracing.html
        tracing: Tracing.ACTIVE,

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