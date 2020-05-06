import { injectable } from 'inversify';
import { classToPlain, plainToClass } from 'class-transformer';
import { ClassType } from 'class-transformer/ClassTransformer';
import * as AWS from 'aws-sdk';
import { AWSError } from 'aws-sdk';
import { PutItemOutput } from 'aws-sdk/clients/dynamodb';
import { DiggingDynamodbClientInterface } from '../interfaces';
require('dotenv').config();
AWS.config.update({region:'us-east-1'});
const dynamoOptions: any = {
  convertEmptyValues: true
};

if(process.env.LOCAL){
  console.log('connecting to local dynamoDb: http://localhost:8000');
  dynamoOptions.endpoint = 'http://localhost:8000';
}

const dynamoDb = new AWS.DynamoDB.DocumentClient(dynamoOptions);

export interface IKey {
  fieldName: string;
  fieldType: 'string' | 'number';
}

export class Key implements IKey{
  fieldName: string;
  fieldType: 'string' | 'number';
}



@injectable()
export abstract class DiggingDynamodbClient<T, K> implements DiggingDynamodbClientInterface<T, K>{
  TableName: string;
  classType: ClassType<T>;
  db: AWS.DynamoDB.DocumentClient;
  constructor(tableName: string){
    this.TableName = tableName;
    this.db = dynamoDb;
  }

  /*
    const key = new TableKey();
    key.id = u.id;
  * const user: User = await api.findOne(key);
  * */
  async findOne(key: K | null): Promise<T | any> {
    if(key !== null){
      try {
        const query = {TableName: this.TableName, Key: key};
        if(process.env.DEBUG && process.env.DEBUG === "true"){
          console.log('Query:', query);
        }
        const data = await this.db.get(query).promise();
        if(data  && data.Item){
          if(this.classType){
            return plainToClass(this.classType, data.Item);
          } else {
            return data.Item;
          }
        } else {
          return null;
        }
      } catch (err) {
        throw new Error("Unable to read item. Error JSON:"+err.message);
      }
    } else {
      throw new Error('DiggingDb error: Key format is not correct');
    }
  }

  /*
  const u2 = new User();
  u2.id = u.id;
  u2.nameName = u.nameName;
  u2.email = 'pauline@gmail.com';
  await api.updateOne(key, u2);
  * */
  async insertOne(item: T): Promise<T | AWSError | PutItemOutput> {
    try {
      const query = {
        TableName:this.TableName,
        Item: classToPlain(item)
      };
      if(process.env.DEBUG && process.env.DEBUG === "true"){
        console.log('Query:', query);
      }
      const response = await dynamoDb.put(query).promise();
      return response;
    } catch (err) {
      throw new Error("Unable to add item. Error JSON: "+err.message);
      return err;
    }
  }

  async getAll(): Promise<T[] | AWSError> {
    try {
      const query = {
        TableName:this.TableName
      };
      if(process.env.DEBUG && process.env.DEBUG === "true"){
        console.log('Query:', query);
      }
      const response = await dynamoDb.scan(query).promise();
      if(response){
        return response.Items.map((item)=>{
          return plainToClass(this.classType, item);
        });
      } else {
        return [];
      }

    } catch (err) {
      throw new Error("Unable to add item. Error JSON: "+err.message);
      return err;
    }
  }

  /* await api.deleteOne(key, 'nameName = :name', {':name': 'andFDrade'}); */
  async updateOne(key: K | null, item: T ): Promise<T | AWSError | PutItemOutput> {
    try {

      const whereClauseStr = [];
      const variables: any = {};

      Object.keys(item).map((feldName)=>{

        if(!key[feldName]){
          whereClauseStr.push(feldName+' = :'+feldName);
          variables[':'+feldName] = item[feldName];
        }

      });

      const query = {
        TableName:this.TableName,
        Key:key,
        UpdateExpression: "set "+whereClauseStr.join(', '),
        ExpressionAttributeValues:variables,
        ReturnValues:"UPDATED_NEW"
      };
      if(process.env.DEBUG && process.env.DEBUG === "true"){
        console.log('Query:', query);
      }
      // @ts-ignore
      const doc = await this.db.update(query).promise();
      return plainToClass(this.classType, doc);
      return item;
    } catch (err) {
      throw new Error("Unable to add item. Error JSON: "+err.message);
      return err;
    }
  }

  /* await api.deleteOne(key, 'nameName = :name', {':name': 'andFDrade'}); */
  async deleteOne(key: K | null, conditionExpression: string, ExpressionAttributeValues: any ): Promise<boolean | AWSError | PutItemOutput> {
    try {
      const query = {
        TableName:this.TableName,
        Key:key,
        ConditionExpression: conditionExpression,
        ExpressionAttributeValues:ExpressionAttributeValues
      };
      if(process.env.DEBUG && process.env.DEBUG === "true"){
        console.log('Query:', query);
      }
      // @ts-ignore
      await this.db.delete(query).promise();
      return true;
    } catch (err) {
      throw new Error("Unable to add item. Error JSON: "+err.message);
      return false;
    }
  }

  async addMany(items: T[]): Promise<void> {

    try{
      while (items.length > 0){
        const itemsToInsert = items.reduce((_item)=>{
          if(_item.length < 26){
            _item.push(items.shift());
          }
          return _item;
        }, []);
        await this.insert25(itemsToInsert);
      }
    } catch (e) {
      throw new Error(e.message);
    }



  }

  async insert25(items: T[]): Promise<void> {
    const params: any = {};
    params.RequestItems = {};
    params.RequestItems[this.TableName] = items.map((_item)=>{
      return {
        PutRequest: {
          Item: _item
        }
      };
    });
    try {
      await this.db.batchWrite(params).promise();
    } catch (err) {
      throw new Error("Unable to add item. Error JSON: "+err.message);
    }
  }
}
