aws sqs send-message --message-body $2 --queue-url $(cat ./cdk-outputs.json | jq -r '.[] | to_entries[] | select(.key | contains("'$1'")).value')
