import {forEach} from 'p-iteration'

import {jsonStringifyPretty} from '../../../helpers/javascript/stringify'
import {fetchCanonicalUrl, fetchTweet} from '../../../helpers/twitter/rest-api/tweet'
import {getQuotedTweet} from '../../../helpers/twitter/rest-api/quote-tweets'
import {full_text, TweetCreateEvent, TweetCreateEvents} from './account-activity-types'
import {readFromEnv} from '../../../helpers/cdk/lambdas/secrets'
import {reply} from '../../../helpers/twitter/rest-api/post'
import {fetchClosestArchiveUrl} from '../../../helpers/archiving/archive-dot-org/retrieve'


const botUserId = readFromEnv('TWITTER_USERID')
const botUserName = readFromEnv('TWITTER_USERNAME')

async function replyWithHelpMessage(requestTweetId: string, reason: string) {
    const message = `${reason} To see how to use me, check the pinned tweet on my profile.`
    await reply(requestTweetId, message)
}

function debug(message: string, obj: unknown) {
    console.log(message)
    console.log(jsonStringifyPretty(obj))
}

async function handleEvent(event: TweetCreateEvent) {

    const requestTweetId = event.id_str

    if (event.user.id_str == botUserId) {
        debug("tweet was by us.", event)
        return
    }

    if (!full_text(event).includes("@" + botUserName)) {
        debug("not an explicit mention", event)
        return
    }

    // TODO: maybe check for inclusion of keyword?

    if (!event.in_reply_to_status_id_str) {
        debug("not in reply to something.", event)
        // TODO: uncomment
        await replyWithHelpMessage(requestTweetId, "Your tweet wasn’t in reply of anything.")
        return
    }

    const targetTweetId = event.in_reply_to_status_id_str
    const targetTweet = await fetchTweet(targetTweetId)

    const quotedTweet = getQuotedTweet(targetTweet)
    if (!quotedTweet) {
        debug("target tweet is not a quote tweet.", event)
        await replyWithHelpMessage(requestTweetId, "The tweet you replied to wasn’t a quote tweet.")
        return
    }

    // TODO: Could search not just archive.org but also archive.today.
    // TODO: Should filter by non-404 responses, or if Twitter does not return 404s on deleted tweets reliably,
    //  then use a persistence layer to store the archive URL for each archived tweet id.
    const quotedTweetUrl = await fetchCanonicalUrl(quotedTweet)
    const archiveUrl = await fetchClosestArchiveUrl(quotedTweetUrl)

    if (!archiveUrl) {
        debug(`quoted tweet is not archived: ${quotedTweetUrl}.`, event)
        await reply(requestTweetId, "Could not find the quoted tweet the archives. Sorry.")
        return
    }

    debug(`replying with archive url: ${archiveUrl}.`, event)
    await reply(requestTweetId, `Here’s an archived version of the quoted tweet: ${archiveUrl}`)

}

export async function handleAccountActivity(body: any) {

    let events
    try {
        events = TweetCreateEvents.check(body)
    } catch (err) {
        console.log("Could not parse incoming account activity.")
        console.log(jsonStringifyPretty(body))
        console.log(jsonStringifyPretty(err))
        throw err
    }

    if (events.for_user_id !== botUserId) {
        debug("for_user_id was not us.", events)
        return
    }

    if (events.user_has_blocked) {
        debug("user_has_blocked was truthy.", events)
        return
    }

    if (!events.tweet_create_events) {
        debug("no tweet_create_events.", events)
        return
    }

    // This runs concurrently, and waits for all to finish.
    await forEach(events.tweet_create_events, handleEvent)

}