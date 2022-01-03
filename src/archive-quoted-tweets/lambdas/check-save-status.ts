import {forEach} from 'p-iteration'

import {SQSEvent} from 'aws-lambda'

import SavePageNow, {JobStatus} from '../../helpers/save-page-now'
import {jsonStringifyPretty} from '../../helpers/javascript/stringify'


async function checkSave(jobId: string) {

    // If we throw an error, SQS will realise the message wasn’t successfully
    //  handled and send it to the Dead Letter Queue.

    let jobStatus: JobStatus

    try {

        const spn = await SavePageNow.create()
        jobStatus = await spn.fetchJobStatus(jobId)

    } catch (err) {
        console.error(`Couldn’t fetch status of job ${jobId}.`)
        throw err
    }

    switch (jobStatus.status) {

        case 'success':

            console.log(`Job ${jobId} was a success!`)
            return

        case 'pending':

            // SHOULD WE REQUEUE THE JOB?
            //
            // Hypothetically, it might be appropriate to requeue the message. But then I’d
            //  want to track the number of times it’s been requeued, to avoid poison-pill
            //  messages (like a jobId of undefined, which is always marked as pending).
            // The complexity of handling all that isn’t worth it. If it’s not done within an
            //  hour, there might be actually some other issue. We need to set some boundary
            //  after which even pending jobs are just considered failed.
            // If we requested Save Page Now to save anytime in the 12 hours instead of as soon
            //  as possible, then it might make more sense to implement a requeueing mechanism.
            //  Right now, it doesn’t, so we just mark the job as failed by throwing an error.

            console.error(`Job ${jobId} was still pending.`)
            throw jsonStringifyPretty(jobStatus)


        case 'error':

            console.error(`Job ${jobId} had an error.`)
            throw jsonStringifyPretty(jobStatus)

        default:

            console.error(`Unexpected response while checking status for job ${jobId}.`)
            throw jsonStringifyPretty(jobStatus)

    }

}

export async function handler(event: SQSEvent) {

    const savesToCheck = event.Records.map(record => record.body)
    await forEach(savesToCheck, checkSave)

}
