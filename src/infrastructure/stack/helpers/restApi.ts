import {IResource} from '@aws-cdk/aws-apigateway/lib/resource'
import {Function} from '@aws-cdk/aws-lambda'
import {LambdaIntegration, RestApi} from '@aws-cdk/aws-apigateway'
import {Construct} from '@aws-cdk/core'
import {RestApiBaseProps} from '@aws-cdk/aws-apigateway/lib/restapi'

import {addCorsOptions} from './_cors'


export function makeApi(scope: Construct, id: string, name?: string, props: RestApiBaseProps = {}) {
    return new RestApi(scope, id, {restApiName: name, ...props})
}

export function addEndpoint(parentEndpoint: IResource, pathPart: string) {
    const endpoint = parentEndpoint.addResource(pathPart)
    addCorsOptions(endpoint)
    return endpoint
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export function addLambdaToEndpoint(resource: IResource, method: HttpMethod, lambda: Function) {
    resource.addMethod(method, new LambdaIntegration(lambda))
}

export function addLambdaToNewEndpoint(parentResource: IResource, pathPart: string, method: HttpMethod, lambda: Function) {
    const endpoint = addEndpoint(parentResource, pathPart)
    addLambdaToEndpoint(endpoint, method, lambda)
    return endpoint
}
