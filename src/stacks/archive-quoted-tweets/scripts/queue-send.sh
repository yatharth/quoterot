# This script is invoked by `npm run`.
#
# It takes two arguments
# 1. (partial) name of queue
# 2. message body

queue_name=$1
message_body=$2

# queue_url=$(cat ./cdk-outputs.json | jq -r '.[] | to_entries[] | select(.key | contains("'$1'")).value')
queue_url=$(aws sqs list-queues | grep -v -i dlq | grep $queue_name | head -n 1 | awk '{print $2}')

aws sqs send-message --message-body $message_body --message-group-id 1 --queue-url $queue_url
