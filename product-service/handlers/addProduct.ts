import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { addProductToDb } from '../src/dataProvider';
import { parseBodyString, validateProductData } from '../helpers';

export const addProduct: APIGatewayProxyHandler = async (event, _context) => {
  const headers = {
    "Access-Control-Allow-Headers" : "Content-Type",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
  };

  try {
    const data = parseBodyString(event.body);
    console.log('parsed product data - ', data);
    const validationResult = validateProductData(data);
    if (!validationResult.status) {
      console.log('product data is invalid - ', validationResult.message);

      return {
        statusCode: 400,
        body: JSON.stringify({ error: validationResult.message }, null, 2),
        headers,
      };
    }

    const result = await addProductToDb(data);

    console.log('result - ', result);

    if (result.status === 'error') {
      console.log('Server error - ', result.error);
      return {
        statusCode: 500,
        body: JSON.stringify(result, null, 2),
        headers,
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result, null, 2),
      headers,
    };
  } catch (err) {
    console.log('Server error - ', err);
    return {
      statusCode: 500,
      body: err,
      headers,
    };
  }
}