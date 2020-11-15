import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import * as AWS from 'aws-sdk';
import * as csv from 'csv-parser';
const BUCKET = 'node-in-aws-s3-pz';

export const importFileParser: APIGatewayProxyHandler = async (event, _context) => {
  const headers = {
    "Access-Control-Allow-Headers" : "Content-Type",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
  };

  try {  
    console.log('importFileParser =>');
    console.log(event.Records);
    for (const record of event.Records) {
      console.log('file name =>', record.s3.object.key);

      const params = {
        Bucket: BUCKET,
        Key: record.s3.object.key,
      };

      await parseAndCopy(params, record);
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

async function parseAndCopy(params, record) {
  return new Promise((resolve, reject) => {
    const s3 = new AWS.S3({ region: 'eu-west-1' });

    s3.getObject(params).createReadStream()
    .pipe(csv())
    .on('data', (data) => console.log(data))
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

      resolve();
    });
  })
}