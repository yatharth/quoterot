#!/usr/bin/env sh
# Restore the webhook running on the AWS servers to be the one registered with Twitter.
#
# You might want to run this, say:
# - after running `npm run webhook:dev` to restore the AWS server webhook as the one registered with Twitter.
# - to register the webhook running on AWS for the first-time after a fresh deploy to AWS.

register_webhook_url=$(cat cdk-outputs.json | jq -r '.[] | to_entries[] | select(.key | contains("registerWebhookEndpointUrl")).value')
curl -X POST $register_webhook_url
