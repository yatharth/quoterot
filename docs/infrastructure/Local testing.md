The problem with testing locally is that AWS SAM can run API Gateways and Lambda functions, but it can’t simulate SS, SNS, or other resources. 

Thus, those resources need to already have been deployed, and then you tell SAM to pass in their URLs or ARNs to the lambda functions as environment variables somehow.

According to [this tutorial](https://sanderknape.com/2019/05/building-serverless-applications-aws-cdk/), you can do something like:

1. Make environment.json with

```
{
    "publishFunction0955FBF8": {
        "QUEUE_URL": "https://sqs.[AWS_REGION].amazonaws.com/[ACCOUNT_ID]/queue"
    }
}
```

2. then run

```
echo '{}' | sam local invoke publishFunction0955FBF8 --env-vars environment.json
```

But I’m still not sure how this works with, say, calling an API endpoint. 

Therefore, I’m just writing off the whole thing and not relying on being able to do this for now.