import {WatchableNodejsFunction} from 'cdk-watch'
import {Construct, Duration} from '@aws-cdk/core'
import {Function, Runtime, Tracing} from '@aws-cdk/aws-lambda'
import {NodejsFunctionProps} from '@aws-cdk/aws-lambda-nodejs'


const defaultProps: NodejsFunctionProps = {

    runtime: Runtime.NODEJS_14_X,

    // This enables X-Ray tracing, which our error monitoring solution Dashbird uses to show better error messages.
    //  https://dashbird.io/docs/quickstart/enable-x-ray/
    // To take full advantage of this, I do need to wrap all AWS calls with the AWS X-Ray wrapper:
    //  https://docs.aws.amazon.com/lambda/latest/dg/nodejs-tracing.html
    // That sounds like a lot of work, so I just don’t.
    tracing: Tracing.ACTIVE,

    // Allow a generous time to finish.
    // Default is 30 seconds, max is 15 minutes.
    timeout: Duration.seconds(30),

}

export function makeLambda(scope: Construct, id: string, filename: string,
    environment: Record<string, string>, extraProps: NodejsFunctionProps = {}): Function {

    return new WatchableNodejsFunction(scope, id, {
        ...defaultProps,
        entry: filename,
        environment,
        ...extraProps,
    })

}
