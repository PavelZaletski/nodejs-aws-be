// @ts-nocheck

import * as AWSMock from 'aws-sdk-mock';
import * as AWS from 'aws-sdk';
import { catalogBatchProcess } from './catalogBatchProcess';
import { headers } from '../constants';

describe('catalogBatchProcess', () => {  
  it('should get proper reponse from catalogBatchProcess handler', async () => {
    AWSMock.setSDKInstance(AWS);
    const data = {
      Subject: 'catalogBatchProcess notification',
      Message: 'test',
      TopicArn: process.env.SNS_ARN
    };

    AWSMock.mock('SNS', 'publish', (_params, callback) => {
      console.log('SSNS3', 'publish', 'mock called');
      callback(null, data);
    });

    jest.mock('pg', () => {
      function mPool () {
        this.connect = async function() {
          return Promise.resolve({
            query: jest.fn(),
            release: jest.fn(),
          });
        };
      }
      return { Pool: jest.fn(() => mPool) };
    });

    const awsEvent = {
      Records: [],
    };

    const response = await catalogBatchProcess(awsEvent);

    expect(response).toEqual({
      body: 'success',
      headers,
      statusCode: 200,
    });
  });
});