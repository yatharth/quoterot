import {Schedule} from '@aws-cdk/aws-events'


// TODO: Consider changing this to daily instead, and updating the comments, README, and
//  Twitter usage info.

// Run every 12 hours and check the lat 14 hours for tweets.
//  (extra two to ensure there’s overlap and we don’t miss any.)
export const RUN_JOB_SCHEDULE = Schedule.cron({
    minute: '0',
    hour: '0,12',
})
export const CHECK_LAST_X_HOURS_OF_TWEETS = 14
