import {String} from 'runtypes'

import {QueueDefinition} from '../../../helpers/cdk/lambdas/queue-definition'
import {QueueClient} from '../../../helpers/cdk/lambdas/queue-client'


export const tweetsToArchiveDefinition: QueueDefinition = {
    baseId: 'tweetsToArchive',
    concurrency: 1,
}

export const tweetsToArchiveClient = new QueueClient(tweetsToArchiveDefinition, String)
