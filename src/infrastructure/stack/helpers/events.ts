import * as eventTargets from '@aws-cdk/aws-events-targets'
import {IFunction} from '@aws-cdk/aws-lambda'
import {Construct} from '@aws-cdk/core'
import {Rule, Schedule} from '@aws-cdk/aws-events'


export function scheduleLambdaEvery(scope: Construct, id: string, lambda: IFunction, schedule: Schedule) {
    const lambdaTarget = new eventTargets.LambdaFunction(lambda)
    new Rule(scope, id, {
        enabled: true,
        schedule,
        targets: [lambdaTarget]
    })
}