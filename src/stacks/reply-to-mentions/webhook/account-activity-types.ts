import {Array, Boolean, Null, Number, Optional, Record, Static, String, Tuple} from 'runtypes'

const Range = Tuple(Number, Number)

const Entities = Record({
    urls: Array(Record({
        url: String,
        expanded_url: String,
        display_url: String,
        indices: Range,
    })),
    user_mentions: Array(Record({
        screen_name: String,
        name: String,
        id_str: String,
        indices: Range,
    })),
})

const TweetCreateEvent = Record({

    created_at: String,    // e.g., 'Sat Dec 25 13:49:18 +0000 2021',
    timestamp_ms: String,  // e.g., '1640440158739'

    id_str: String,

    text: String,
    display_text_range: Range.optional(),
    truncated: Boolean,
    extended_tweet: Optional(Record({
        full_text: String,
        display_text_range: Range.optional(),
        entities: Entities,
    })),
    entities: Entities,

    is_quote_status: Boolean,

    in_reply_to_status_id_str: String.Or(Null),
    in_reply_to_user_id_str: String.Or(Null),
    in_reply_to_screen_name: String.Or(Null),

    quote_count: Number,
    reply_count: Number,
    retweet_count: Number,
    favorite_count: Number,

    favorited: Boolean,
    retweeted: Boolean,

    user: Record({
        id_str: String,
        name: String,
        screen_name: String,

        protected: Boolean
    })

})

export function full_text(tweetCreateEvent: Static<typeof TweetCreateEvent>) {
    if (tweetCreateEvent.extended_tweet) {
        return tweetCreateEvent.extended_tweet.full_text.slice(...tweetCreateEvent.extended_tweet.display_text_range || [0])
    } else {
        return tweetCreateEvent.text.slice(...tweetCreateEvent.display_text_range || [0])
    }
}

export const TweetCreateEvents = Record({
    for_user_id: String,
    user_has_blocked: Boolean.optional(),
    tweet_create_events: Optional(Array(TweetCreateEvent)),
})

export type TweetCreateEvent = Static<typeof TweetCreateEvent>
