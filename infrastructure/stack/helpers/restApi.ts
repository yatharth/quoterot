import {IResource} from '@aws-cdk/aws-apigateway/lib/resource'
import {Function as lambdaFunction} from '@aws-cdk/aws-lambda'
import {LambdaIntegration, RestApi} from '@aws-cdk/aws-apigateway'
import {Construct} from '@aws-cdk/core'
import {RestApiBaseProps} from '@aws-cdk/aws-apigateway/lib/restapi'

import {addCorsOptions} from './_cors'


export function makeApi(scope: Construct, id: string, name?: string, props: RestApiBaseProps = {}) {
    return new RestApi(scope, id, {restApiName: name, ...props})
}

export function addUrlPart(parentResource: IResource, pathPart: string) {
    const childResource = parentResource.addResource(pathPart)
    addCorsOptions(childResource)
    return childResource
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export function addLambdaHandler(resource: IResource, method: HttpMethod, lambda: lambdaFunction) {
    resource.addMethod(method, new LambdaIntegration(lambda))
}
