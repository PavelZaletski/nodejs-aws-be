import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { getProducts } from '../src/dataProvider';


export const getProductsList: APIGatewayProxyHandler = async (event, _context) => {
  try {
    const data = await getProducts();
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