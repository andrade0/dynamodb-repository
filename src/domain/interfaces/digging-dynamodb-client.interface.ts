import { ClassType } from 'class-transformer/ClassTransformer';
import * as AWS from 'aws-sdk';
import { AWSError } from 'aws-sdk';
import { PutItemOutput } from 'aws-sdk/clients/dynamodb';

export interface DiggingDynamodbClientInterface<T, K> {
  TableName: string;
  classType: ClassType<T>;
  db: AWS.DynamoDB.DocumentClient;
  findOne(key: K | null): Promise<T | any>;
  insertOne(item: T): Promise<T | AWSError | PutItemOutput>;
  insertOne(item: T): Promise<T | AWSError | PutItemOutput>;
  getAll(): Promise<T[] | AWSError>;
  updateOne(key: K | null, item: T ): Promise<T | AWSError | PutItemOutput>;
  getAll(): Promise<T[] | AWSError>;
  deleteOne(key: K | null, conditionExpression: string, ExpressionAttributeValues: any ): Promise<boolean | AWSError | PutItemOutput>;
  addMany(items: T[]): Promise<void>;
  insert25(items: T[]): Promise<void>;
}
