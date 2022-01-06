// Functions for fetching timelines of users.

import {endOfHour, subHours} from 'date-fns'

import {client} from './_auth'
import {verifyNoErrors} from './_errors'
import {tweetParamsToFetch} from './tweet'


export async function getTimelineBetween(userId: string, startTime: Date, endTime: Date) {

    const timeline = await client.v2.userTimeline(userId, {
        max_results: 100,  // 100 is the maximum allowed.
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        ...tweetParamsToFetch,
    })

    console.log(`Fetched ${timeline.tweets.length} tweets.`)

    while (timeline.meta?.next_token) {
        console.log("Fetching more tweets...")
        await timeline.fetchNext()
        console.log(`Now fetched ${timeline.tweets.length} tweets.`)
    }

    // @ts-ignore
    verifyNoErrors(timeline, "getting timeline", [
        "Sorry, you are not authorized to see the user with",
        "Sorry, you are not authorized to see the Tweet with",
        "Could not find tweet with",
    ])

    return timeline

}

export async function getTimelineFromLastXHours(userid: string, hours: number) {

    // I align the date to the hour, because that way, I can more easily recreate the exact Twitter API call
    //  being made in a serverless environment on my local machine.
    const now = new Date()
    const nowAlignedToHour = endOfHour(now)
    const endTime = nowAlignedToHour
    const startTime = subHours(endTime, hours)

    console.log(`Retrieving tweets from ${startTime.toISOString()} to ${endTime.toISOString()}.`)

    const timeline = await getTimelineBetween(userid, startTime, endTime)

    return timeline

}
