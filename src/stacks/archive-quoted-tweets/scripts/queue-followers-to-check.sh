#!/usr/bin/env sh
# This script is invoked by `npm run`.
# It just calls the queueFollowersToCheck lambda function through its exposed API endpoint.

endpointUrl=$(cat ./cdk-outputs.json | jq -r '.[] | to_entries[] | select(.key | contains("queueFollowersToCheckEndpointUrl")).value')
curl -X POST $endpointUrl
