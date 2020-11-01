import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { getProductItemById } from '../src/dataProvider';

export const getProductById: APIGatewayProxyHandler = async (event, _context) => {
  try {  
    const id = event.pathParameters.id;
    const data = await getProductItemById(id);
    return {
      statusCode: 200,
      body: JSON.stringify(data, null, 2),
      headers: {
        "Access-Control-Allow-Headers" : "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
      },
    };
  } catch (err) {
    return err;
  }
}