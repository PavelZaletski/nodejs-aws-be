import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { getProductItemById } from '../src/dataProvider';

export const getProductById: APIGatewayProxyHandler = async (event, _context) => {
  const headers = {
    "Access-Control-Allow-Headers" : "Content-Type",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
  };

  try {  
    const id = event.pathParameters.id;
    const data = await getProductItemById(id);
    if (data) {
      const body = JSON.stringify(data, null, 2);
      return {
        statusCode: 200,
        body,
        headers,
      };
    }
    return {
      statusCode: 404,
      body: 'not found',
      headers,
    };
  } catch (err) {
    return {
        statusCode: 500,
        headers,
        body: err,
    };
  }
}