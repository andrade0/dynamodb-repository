/*
import { interfaces } from 'inversify';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
require('dotenv').config();
import 'reflect-metadata';
import * as AWS from 'aws-sdk';
require('dotenv').config();
AWS.config.update({region:'us-east-1'});
const dynamoOptions: any = {
  convertEmptyValues: true
};

if(process.env.LOCAL){
  console.log('connecting to local dynamoDb: http://localhost:8000');
  dynamoOptions.endpoint = 'http://localhost:8000';
}

const dynamoDb: DocumentClient = new AWS.DynamoDB.DocumentClient(dynamoOptions);

import { TYPES }  from './types';
import { container } from './infrastructure/ioc';
import { DiggingDynamodbClientInterface } from './domain/interfaces';
import { DiggingDynamodbClient } from './domain/classes';

container.bind<AWS.DynamoDB.DocumentClient>(TYPES.DynamoDBInstance).toConstantValue(dynamoDb);
container.bind<DiggingDynamodbClientInterface>(TYPES.DiggingDynamodbClientInterface).to(DiggingDynamodbClient);
*/
