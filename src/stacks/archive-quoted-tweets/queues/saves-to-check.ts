import {Record, String} from 'runtypes'

import {QueueDefinition} from '../../../helpers/cdk/lambdas/queue-definition'
import {QueueClient} from '../../../helpers/cdk/lambdas/queue-client'


export const savesToCheckDefinition: QueueDefinition = {
    baseId: 'savesToCheck',
    concurrency: 1,
}

export const savesToCheckClient = new QueueClient(savesToCheckDefinition, Record({
    jobId: String,
    tweetUrl: String,
}))
