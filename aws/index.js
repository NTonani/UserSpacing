'use strict';

const doc = require('dynamodb-doc');

const dynamo = new doc.DynamoDB();

exports.handler = (event, context, callback) => {

    const done = (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? err.message : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    
    var params = {
        TableName: process.env.TABLE_NAME
    };

    switch (event.httpMethod) {
        case 'GET':
            params.KeyConditionExpression = "UserId = :uid";
            params.ExpressionAttributeValues = {
                ":uid":event.pathParameters.uid
            };
            dynamo.query(params, done);
            break;
        case 'POST':
            params.Item = event.body;
            dynamo.putItem(params, done);
            break;
        default:
            done(new Error(`Unsupported method "${event.httpMethod}"`));
    }
};