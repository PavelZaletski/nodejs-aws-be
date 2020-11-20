import { S3Event } from 'aws-lambda';
import 'source-map-support/register';
import * as AWS from 'aws-sdk';
import * as csv from 'csv-parser';
import { headers } from '../constants';
const BUCKET = 'node-in-aws-s3-pz';

export const importFileParser = async (event: S3Event, _context) => {
  console.log('importFileParser =>');
  console.log(event.Records);
  try {
    for (const record of event.Records) {
      const params = {
        Bucket: BUCKET,
        Key: record.s3.object.key,
      };

      await parseAndSendMessage(params, record);
    }

    return {
      statusCode: 200,
      body: 'success',
      headers,
    };
  } catch (err) {
    console.log('Server error - ', err);
    return {
        statusCode: 500,
        headers,
        body: err,
    };
  }
}

async function parseAndSendMessage(params, record) {
  return new Promise((resolve, reject) => {
    const s3 = new AWS.S3({ region: 'eu-west-1' });
    const sqs = new AWS.SQS();
    const result = [];

    s3.getObject(params).createReadStream()
    .pipe(csv())
    .on('data', (data) => {
      console.log(data);
      result.push(data);
    })
    .on('end', async() => {
      await s3.copyObject({
        Bucket: BUCKET,
        CopySource: BUCKET + '/' + record.s3.object.key,
        Key: record.s3.object.key.replace('uploaded', 'parsed')
      }).promise();

      console.log('copied');

      await s3.deleteObject({
        Bucket: BUCKET,
        Key: record.s3.object.key
      }).promise();

      console.log('deleted');

      sqs.sendMessage({
        QueueUrl: process.env.SQS_URL,
        MessageBody: JSON.stringify(result),
      }, (err, data) => {
        if (err) {
          console.log('err =>', err, err.stack);
          reject(err);
        } else  {
          console.log('data =>', data);  
          resolve();
        }
      });
    });
  });
}