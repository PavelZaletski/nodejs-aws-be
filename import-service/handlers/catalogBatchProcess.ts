import 'source-map-support/register';
import { SQSEvent } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { headers } from '../constants';
import { addProductToDb } from '../helpers';

export const catalogBatchProcess: any = async (event: SQSEvent, _context) => {
  const sns = new AWS.SNS();

  sns.publish({
    Subject: 'catalogBatchProcess notification',
    Message: 'test',
    TopicArn: process.env.SNS_ARN
  }, () => {
    console.log('Notification sent');
  });

  try {  
    console.log('catalogBatchProcess =>');
    for (const record of event.Records) {
      console.log('record =>', record);
      const data = JSON.parse(record.body);
      console.log('parsed data =>', data);

      for(const item of data) {
        console.log('item =>', item);
        await addProductToDb(item);
      }
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
