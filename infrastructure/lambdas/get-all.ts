import {makeResponse} from './helpers/response'
import {Runtime} from '@aws-cdk/aws-lambda'

export const handler = async (): Promise<any> => {
    Runtime.NODEJS_14_X;
    return makeResponse(200, `Your list of items is [foo*].`)
};