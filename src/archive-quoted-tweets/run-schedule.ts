import {Schedule} from '@aws-cdk/aws-events'


// TODO: Think it should include “day to check for.”

// Run regularly and check the last period for tweets.
//  (an extra to ensure there’s overlap and we don’t miss any.)
export const RUN_JOB_SCHEDULE = Schedule.cron({
    minute: '0',
    hour: '0,12',
})
export const CHECK_LAST_X_HOURS_OF_TWEETS = 14
