import urljoin from 'url-join'

import {IResource} from '@aws-cdk/aws-apigateway/lib/resource'
import {Function} from '@aws-cdk/aws-lambda'
import {LambdaIntegration, RestApi} from '@aws-cdk/aws-apigateway'
import {Construct} from '@aws-cdk/core'
import {RestApiBaseProps} from '@aws-cdk/aws-apigateway/lib/restapi'

import {addCorsOptions} from './_cors'
import {makeCfnOutput} from './cfn'
import {getId} from './cdk'


export function makeRestApi(scope: Construct, id: string, name?: string, props: RestApiBaseProps = {}) {
    return new RestApi(scope, id, {restApiName: name, ...props})
}

export function addEndpoint(parentEndpoint: IResource, pathPart: string) {
    const endpoint = parentEndpoint.addResource(pathPart)
    addCorsOptions(endpoint)
    return endpoint
}

function makeCfnOutputForEndpoint(api: RestApi, id: string, endpoint: IResource) {
    const scope = api.stack
    const url = urljoin(api.url, endpoint.path)
    makeCfnOutput(scope, id, url)
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export function addLambdaToEndpoint(api: RestApi, endpoint: IResource, methods: HttpMethod[], lambda: Function, shouldMakeCfnOutput: boolean) {

    for (const method of methods) {
        endpoint.addMethod(method, new LambdaIntegration(lambda))
    }

    if (shouldMakeCfnOutput) {
        const cfnOutputId = `${getId(lambda)}Url`
        makeCfnOutputForEndpoint(api, cfnOutputId, endpoint)
    }

}

export function addLambdaToNewEndpoint(api: RestApi, methods: HttpMethod[], parentResource: IResource, pathPart: string, lambda: Function, shouldMakeCfnOutput: boolean) {
    const endpoint = addEndpoint(parentResource, pathPart)
    addLambdaToEndpoint(api, endpoint, methods, lambda, shouldMakeCfnOutput)
    return endpoint
}
