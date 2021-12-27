// import * as core from "@aws-cdk/core";
// import * as apigateway from "@aws-cdk/aws-apigateway";
// import * as lambda from "@aws-cdk/aws-lambda";
// import * as s3 from "@aws-cdk/aws-s3";
//
// export class WidgetService extends core.Construct {
//     constructor(scope: core.Construct, id: string) {
//         super(scope, id);
//
//         const bucket = new s3.Bucket(this, "WidgetStore");
//
//         const handler = new lambda.Function(this, "WidgetHandler", {
//             runtime: lambda.Runtime.NODEJS_10_X, // So we can use async in widget.js
//             code: lambda.Code.fromAsset("resources"),
//             handler: "widgets.main",
//             environment: {
//                 BUCKET: bucket.bucketName
//             }
//         });
//
//         bucket.grantReadWrite(handler); // was: handler.role);
//
//         const api = new apigateway.RestApi(this, "widgets-api", {
//             restApiName: "Widget Service",
//             description: "This service serves widgets."
//         });
//
//         const getWidgetsIntegration = new apigateway.LambdaIntegration(handler, {
//             requestTemplates: { "application/json": '{ "statusCode": "200" }' }
//         });
//
//         api.root.addMethod("GET", getWidgetsIntegration); // GET /
//     }
// }