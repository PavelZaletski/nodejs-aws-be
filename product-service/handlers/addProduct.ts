import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { addProductToDb } from '../src/dataProvider';
import { parseBodyString } from '../helpers/parseBodyString';

export const addProduct: APIGatewayProxyHandler = async (event, _context) => {
  const headers = {
    "Access-Control-Allow-Headers" : "Content-Type",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
  };

  const data = parseBodyString(event.body);

  const result = await addProductToDb(data);

  try {
    return {
      statusCode: 200,
      body: JSON.stringify({body: event.body, data, result}, null, 2),
      headers,
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: err,
      headers,
    };
  }
}