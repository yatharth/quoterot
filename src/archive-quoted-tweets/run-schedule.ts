import {Schedule} from '@aws-cdk/aws-events'

// Run job 12 hours, but check for tweets from last 14 hours so we don’t miss any.
export const RUN_JOB_SCHEDULE = Schedule.cron({
    minute: '0',
    hour: '0,12',
})
export const CHECK_LAST_X_HOURS_OF_TWEETS = 14
