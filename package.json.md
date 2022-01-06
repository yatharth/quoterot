This file just contains extra comments about package.json


## Dependencies

`@types/node` has typings for things included in node, but not typed, like the `fs` module.

---

When upgrading, keep in mind that the @aws-cdk libaries should have the same minor number. Otherwise, compatability issues arise. This is why I pin versions to the minor number using ~ instead of the major one with ^. Also make sure the version number kept in sync with your computer’s CDK CLI utility.

---

While installing `cdk-watch`, you might run into a dependency conflict error. Try running `npm install cdk-watch --legacy-peer-deps` to resolve it.


## Scripts

You have to include -- in npm run commands like so: `npm run -- cdk:deploy --all`. Otherwise, command-line arguments like `--all` with get stolen and silently dropped by `npm run` instead of being passed to your command. 

---

* Don’t use the `--no-rollback` option with `cdk deploy`. It confuses CDK when it tries to deploy after failed updates. You end up having to destroy the entire stack before updating it.
* Don’t use the `--hotswap` option with `cdk deploy`. It implies `--no-rollback` which is problematic, and even if you pass in `--rollback` explicitly, it’s faster and better to run `npm run -- lambdas:hotswap` instead.
* Don’t use the `--watch` option with `cdk deploy`. It’s faster and better to use `npm run lambdas:watch` instead, which uses the `cdk-watch` package under the hood to watch your lambda function code and hotswap them in as necessary.

---

TODO: Document all the `npm run` commands and mention this in the main README.md file.

