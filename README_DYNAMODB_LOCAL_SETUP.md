#### Start dynamoDb localy ( localy )
```
cd ~/dev/dynamodb
java -Djava.library.path=./DynamoDBLocal_lib -jar /Users/andrade/dev/dynamodb/DynamoDBLocal.jar -sharedDb
```

#### Show all tables ( localy )
```
aws dynamodb list-tables --endpoint-url http://localhost:8000
```

#### Create table ( localy )
```
aws dynamodb create-table \
    --table-name users \
    --attribute-definitions \
        AttributeName=id,AttributeType=S \
        AttributeName=nameName,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH AttributeName=nameName,KeyType=RANGE \
    --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
    --endpoint-url http://localhost:8000
```
OR
```
aws dynamodb create-table \
    --table-name DiscogsCacheModule \
    --attribute-definitions \
        AttributeName=cacheKey,AttributeType=S \
    --key-schema AttributeName=cacheKey,KeyType=HASH \
    --provisioned-throughput ReadCapacityUnits=1,WriteCapacityUnits=1 \
    --endpoint-url http://localhost:8000
```

#### Insert item ( localy )
```
aws dynamodb put-item \
    --table-name users  \
    --item \
        '{"id": {"S": "fdhfjghd543543"}, "nameName": {"S": "olivier"}, "AlbumTitle": {"S": "Somewhat Famous"}}' \
    --return-consumed-capacity TOTAL \
    --endpoint-url http://localhost:8000 
```
OR
```
aws dynamodb put-item \
--table-name users \
--item '{ \
    "id": {"S": "fdhfjghd543tt"}, \
    "nameName": {"S": "jeremy"}, \
    "AlbumTitle": {"S": "Songs About Life"} }' \
--return-consumed-capacity TOTAL \
--endpoint-url http://localhost:8000
```

#### Usage exemple: 

```
import { DiggingDynamodbClient } from './domain/classes';

// Entity difinition
class User{
  id: string;
  nameName: string;
  email: string;
}

// Object definition for table kay
class TableKey{
  id: string;
  nameName: string
}


class UserRepository extends DiggingDynamodbClient<User, TableKey> {
  constructor(
    public TableName = 'users',
    public classType = User,
  ) {
    super(TableName);
  }
}

const api = new UserRepository();

(async () => {
  const u = new User();
  u.id = 'FEZF43TFDF';
  u.nameName = 'andFDrade';
  u.email = 'andradeolivier@gmail.com';
  const key = new TableKey();
  key.id = u.id;
  key.nameName = u.nameName;
  await api.insertOne(u);
  const u2 = new User();
  u2.id = u.id;
  u2.nameName = u.nameName;
  u2.email = 'pauline@gmail.com';
  await api.updateOne(key, u2);
  const user: User = await api.findOne(key);
  console.log(user)
  await api.deleteOne(key, 'nameName = :name', {':name': 'andFDrade'});
  const users = await api.getAll();
  console.log(users)
})();
```

#### More doc : https://docs.aws.amazon.com/fr_fr/amazondynamodb/latest/developerguide/Tools.CLI.html