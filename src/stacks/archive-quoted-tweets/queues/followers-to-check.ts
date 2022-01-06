import {Record, String} from 'runtypes'

import {QueueDefinition} from '../../../helpers/cdk/lambdas/queue-definition'
import {QueueClient} from '../../../helpers/cdk/lambdas/queue-client'


export const followersToCheckDefinition: QueueDefinition = {
    baseId: 'followersToCheck',
    concurrency: 1,
}

// TODO: Add a “day” field, so the consuming lambda knows to check for that day specifically.
//  This way, the processing of a message does not depend on what time it is consumed.
//  Instead, I can requeue old messages that failed earlier, and they can be reprocessed for that day.

export const followersToCheckClient = new QueueClient(followersToCheckDefinition, Record({
    followerId: String,
}))
