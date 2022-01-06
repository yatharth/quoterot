// General heleprs for working with CDK and Cloudformation.

import {CfnOutput, Construct} from '@aws-cdk/core'


// Get the ID of a construct as we supply it in the code.
export function getId(construct: Construct) {
    return construct.node.id
}

// Make a CloudFormation template output for the given key and value.
export function makeCfnOutput(scope: Construct, id: string, value: any) {
    return new CfnOutput(scope, id, {value})
}
