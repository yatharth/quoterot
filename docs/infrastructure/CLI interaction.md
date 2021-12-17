
# SQS

```shell
# https://docs.aws.amazon.com/cli/latest/reference/sqs/send-message.html
aws sqs list-queues
aws sqs get-queue-url --queue-name "YOUR_QUEUE_NAME"
aws sqs send-message 
    --message-body "Here’s a message! 🍳" \
    --queue-url "YOUR_QUEUE_URL" 
```


# SNS

```shell
aws sns publish \
    --subject "Just testing 🚀" \
    --message "Hello world 🐊" \
    --topic-arn "YOUR_SNS_TOPIC_ARN"
```

