import {QueueRuntime} from '../../helpers/cdk/lambdas/sqs'
import {TweetUrl} from '../../helpers/twitter/rest-api/tweet'

const SaveToCheck = TweetUrl

export const savesToCheck = new QueueRuntime({
    baseId: 'savesToCheck',
    runtype: SaveToCheck,
    concurrency: 1,
})
