import {Construct} from '@aws-cdk/core'

export function getId(construct: Construct) {
    return construct.node.id
}