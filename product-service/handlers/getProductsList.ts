import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { getProducts } from '../src/dataProvider';


export const getProductsList: APIGatewayProxyHandler = async (event, _context) => {
  try {
    const data = await getProducts();
    return {
      statusCode: 200,
      body: JSON.stringify(data, null, 2),
    };
  } catch (err) {
    return err;
  }
}