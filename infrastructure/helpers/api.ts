import {Construct} from '@aws-cdk/core'
import {LambdaIntegration, RestApi} from '@aws-cdk/aws-apigateway'
import {IResource} from '@aws-cdk/aws-apigateway/lib/resource'
import {NodejsFunction, NodejsFunctionProps} from '@aws-cdk/aws-lambda-nodejs'
import {Runtime} from '@aws-cdk/aws-lambda'
import {addCorsOptions} from './cors'

export function makeRestApi(scope: Construct, id: string, name: string) {
    return new RestApi(scope, id, {
        restApiName: name,
    })
}

export function addResourceWithCors(parentResource: IResource, pathPart: string) {
    const childResource = parentResource.addResource(pathPart)
    addCorsOptions(childResource)
    return childResource
}

// TODO: I could be adding type-checking to this? See widget-service.ts
export function makeLambdaIntegration(scope: Construct, id: string, filename: string, depsLockFilePath: string):
    [LambdaIntegration, NodejsFunction] {

    const nodeJsFunctionProps: NodejsFunctionProps = {
        runtime: Runtime.NODEJS_14_X,
        depsLockFilePath,

        // The default bundling options are fine.
        // https://docs.aws.amazon.com/cdk/api/latest/docs/@aws-cdk_aws-lambda-nodejs.NodejsFunction.html#bundling
        // bundling: { externalModules: ['aws-sdk'], },
    }

    const lambda = new NodejsFunction(scope, id, {entry: filename, ...nodeJsFunctionProps})
    const lambdaIntegration = new LambdaIntegration(lambda)
    return [lambdaIntegration, lambda]
}
