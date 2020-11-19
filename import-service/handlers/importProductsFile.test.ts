// @ts-nocheck

import * as AWSMock from 'aws-sdk-mock';
import * as AWS from 'aws-sdk';
import { importProductsFile } from './importProductsFile';
import { headers } from '../constants';

describe('importProductsFile', () => {  
  it('should mock getSignedUrl from S3', async () => {
    AWSMock.setSDKInstance(AWS);
    const mockSignedUrl = 'test';

    AWSMock.mock('S3', 'getSignedUrl', (action, _params, callback) => {
      console.log('S3', 'getSignedUrl', 'mock called');
      callback(null, mockSignedUrl);
    });

    const awsEvent = {
      queryStringParameters: {
        name: 'products.csv'
      },
    };

    const response = await importProductsFile(awsEvent);

    expect(response).toEqual({
      body: mockSignedUrl,
      headers,
      statusCode: 200
    });
  });
});