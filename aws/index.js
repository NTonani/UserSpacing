'use strict';

const doc = require('dynamodb-doc');

const dynamo = new doc.DynamoDB();

const itemFormatter = (body) => {
    var item = {};
    item.UserId = body.uid;
    item.URL = body.url;
    item.CreatedMs = body.created;
    return item;
}

const spacingAlgo = (items) => {
    const oneDayMs = 1000 * 60 * 60 * 24; 
    return items.filter(item => 
        Math.log2(
            Math.round((new Date().getTime() - item.CreatedMs)/oneDayMs)
        ) % 1 == 0
    );
}

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
            dynamo.query(params, function(err, res) {
                if (err) {
                    done(err,res);
                } else {
                    done(err, spacingAlgo(res.Items));
                }
            });
            break;
        case 'POST':
            params.Item = itemFormatter(event.body);
            dynamo.putItem(params, done);
            break;
        default:
            done(new Error(`Unsupported method "${event.httpMethod}"`));
    }
};