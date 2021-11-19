import {App, Stack} from '@aws-cdk/core'
import {join} from 'path'
import {addResourceWithCors, makeLambdaIntegration, makeRestApi} from './helpers/api'


export class QuoteRotStack extends Stack {
    constructor(app: App, id: string) {
        super(app, id)

        const lambdasDir = join(__dirname, 'lambdas');
        const depsLockFilePath = join(lambdasDir, 'package-lock.json');

        const makeQuoteRotLambdaIntegration = (id: string, basename: string) => {
            const filename = join(lambdasDir, basename)
            const [lambdaIntegration] = makeLambdaIntegration(this, id, filename, depsLockFilePath);
            return lambdaIntegration;
        }

        const api = makeRestApi(this, 'QuoteRotApi', "Quote Rot API")

        const apiItems = addResourceWithCors(api.root, 'items')
        apiItems.addMethod('GET', makeQuoteRotLambdaIntegration('getAllIntegration', 'get-all.ts'))

        const apiItemsId = addResourceWithCors(apiItems, '{id}');
        apiItemsId.addMethod('GET', makeQuoteRotLambdaIntegration('getOneIntegration', 'get-one.ts'))

    }
}

const app = new App()
new QuoteRotStack(app, 'QuoteRotStack')
app.synth()
