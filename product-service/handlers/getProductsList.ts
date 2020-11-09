import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { getProducts } from '../src/dataProvider';


export const getProductsList: APIGatewayProxyHandler = async (event, _context) => {
  const headers = {
    "Access-Control-Allow-Headers" : "Content-Type",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
  };

  try {
    const data = await getProducts();
    if (data) {
      return {
        statusCode: 200,
        body: JSON.stringify(data, null, 2),
        headers,
      };
    }

    console.log('Products not found');

    return {
      statusCode: 404,
      body: 'not found',
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