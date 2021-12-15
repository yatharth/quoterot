import {CfnOutput, Construct} from '@aws-cdk/core'

export function makeCfnOutput(scope: Construct, id: string, value: any) {
    return new CfnOutput(scope, id, {
        value,
    })
}