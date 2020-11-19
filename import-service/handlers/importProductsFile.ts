import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import * as AWS from 'aws-sdk';
import { headers } from '../constants';

const BUCKET = 'node-in-aws-s3-pz';

export const importProductsFile: APIGatewayProxyHandler = async (event, _context) => {
  try {
    const catalogName = event.queryStringParameters.name;
    const catalogPath = `uploaded/${catalogName}`;

    const s3 = new AWS.S3({ region: 'eu-west-1' });
    const params = {
      Bucket: BUCKET,
      Key: catalogPath,
      Expires: 60,
      ContentType: 'text/csv',
    };

    return new Promise((resolve, reject) => {
      s3.getSignedUrl('putObject', params, (err, url) => {
        if (err) {
          return reject(err);
        }

        resolve({
          statusCode: 200,
          headers: headers,
          body: url,
        });
      });
    });
  } catch (err) {
    console.log('Server error - ', err);
    return {
      statusCode: 500,
      body: err,
      headers,
    };
  }
}
