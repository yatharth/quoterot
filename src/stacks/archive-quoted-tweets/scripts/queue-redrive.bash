#!/usr/bin/env bash
# This script uses the npm package [replay-aws-dlq](https://github.com/garryyao/replay-aws-dlq)
#  to move messages from one queue to another.
#
# I use this to redrive messages from one of the Dead Letter Queues back to its original queue.
#
# While the AWS Console can do redrives this for regular queues, it cannot do so for FIFO queues.
#
# Please be aware that for FIFO queues with deduplication enabled, and messages in DLQ that originally came from it,
#  you'll need to cool down for at least 5 minutes before you can start driving messages back, otherwise
#  the messages you redrive will not end up not showing in the original queue.

# You’ll also need the gron tool installed
# You can install it using `brew install gron`.

queueName=$1

queueUrl=$(gron cdk-outputs.json | fgrep $queueName | grep -i -v dlq | awk -F \" '{print $2}')
dlqUrl=$(gron cdk-outputs.json | fgrep $queueName | grep -i dlq | awk -F \" '{print $2}')

npx replay-aws-dlq $dlqUrl $queueUrl
