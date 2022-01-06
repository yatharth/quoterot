# First-time setup

If you’re working with Yatharth, ignore this file. He’s done all of this already.

If you’re deploying this project independently, then follow these instructions. These steps can’t be automated or declared with code, unfortunately, so they have to be done manually. Once you’re done, you can follow the Installation instructions inside the `docs/` folder.


## AWS

1. Create an IAM user using [this guide](https://docs.aws.amazon.com/IAM/latest/UserGuide/getting-started_create-admin-group.html).
2. On the Details page, check both “AWS Management Console access” and “Programmatic access”. The latter generates an Access ID and Secret Access Key for the user that you’ll need for the AWS CLI.
3. Note down the Access ID and Secret Access Key.


## Twitter

1. Go to the Twitter Developer Portal and apply for access to the v2 API. Wait for approval.
2. In the portal, find your project, and note down its consumer secrets.
3. Generate a bearer token and note it down.
4. Generate OAuth secrets and note them down.
5. Generate access token secrets and note them down.
6. Apply for Elevated access (to use the Account Activity API). Wait for approval.
7. In the portal, create an Account Activity API dev environment and note its name down.


## archive.org

1. Create an archive.org account.
2. Note down your username and password.


## Dashbird

1. Create a [Dashbird][dashbird] account. Connect it to your AWS using the steps they walk you through.
2. Add all the emails you want to be notified in case of an error.
3. Create a Resource Group with all the Lambdas.
4. Create 2 Alarms for when the error counts or throttles exceeds 0.


[archive.org]: https://web.archive.org
[archive.today]: https://archive.today
[cdk]: https://aws.amazon.com/cdk/
[dashbird]: https://dashbird.io
[yatharthemail]: mailto:yatharth999@gmail.com
