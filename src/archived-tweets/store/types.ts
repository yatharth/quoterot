import {Record, Unknown, Union, String, Literal, Static} from 'runtypes'


export const TweetId = 'tweetId'

export const SaveStatus = Union(Literal('pending'), Literal('success'), Literal('error'))

export const ArchivedTweet = Record({

    [TweetId]: String,

    tweetUsernameAsSaved: String,
    tweetUrlAsSaved: String,

    lastSaveDate: String,
    lastSaveStatus: SaveStatus,

    tweetObject: Unknown.optional(),
    userObject: Unknown.optional(),

})

export type ArchivedTweet = Static<typeof ArchivedTweet>
