
Terrible! I just want an Erlang like message-actor based model, where elastic queues buffer between actors, and the pool of actors for each queue can be managed; items can be replayed, sent, captured, etc.

Using SQS queues and lambdas is a bit much? But why. 

What about handling errors? If one part of API filled, previous error and it explodes.
How to make sure handles old data without loss?
Want some redux model, where you store the initial actions in a safe layer UNTIl the next layer marks as deleted.
And each action is atomic, and moves up as needed.


Right now, logic for each component is spread: some of it in stack.ts because it needs the scope or `this` to construct, some of it in files.

Instead, it should work like this: each “resource” (to us), be it a table type thing, or whatever, is its own file or folder that defines a contract. It internally has a makeConstruct(scope: Construct) function it exposes, that the stacks initialise, but it takes care of props and such. Things like tables might expose a makeClient() which reads from an environment variable *specific* to the resouce. As well as a connectToResource(resource) method that the stack uses to make sure that resource will be able to call makeClient() just fine.

If a resource of ours doesn’t need an entire file, sure, can be done inline. But really, any queue should be type-checked, and offer type-checked queueing and dequeuing functions. E.g., to queue to it, you call blah, which must be typed, and it queues. To dequeue, it first runtype-checks the data, and then returns. All the “ops” on the resource are defined. The resource might correspond to just one AWS construct, but for our purposes, unnecessary.



Truly impressed by AWS. All the services are here. Yes, I could run RabbitMQ and such on a server. But the auto-scaling. Yes, could get diff 3rd party providers. But being integrated into a single place. For billing, CloudFormating, etc. Auto-scaling rules all demands. And if you want, guess you could do AWS server instances.




/*

TODO: I want to be able to run the lambda functions locally. How?

1. They would need access to environment variables for the queue URL and table na,e.
2. I would need to provide locally-runnable invokers. Right now, they expect SQS events in the handlers.

For the first problem, I need to log the relevant variables to cdk-outputs.json. Probably, in the table or queue
constructors, they could just create the CFN output with the right environment variable name too.

Then later, some module could parse cdk-outputs.json those things, and load them into the environment under those names.
This would mean each queue and table using separate environment variables, which is something we should be doing anyway.

The second problem is more finnicky. It may just be worth it to call them from a Typescript notebook, where I use for
my local testing and running needs.

*/


1. Typecheck everything. Every type error is an error you don’t have to find out about at runtime.
dequeue/enqueue
absarcte service model, your cod eonly interacts with and it wraps
to construct these easier, a set of pormitiers
these initialise, etc, everything

2. Develp quick.
Typescript notebok
3. Develop in same environment.
cdk-watch
