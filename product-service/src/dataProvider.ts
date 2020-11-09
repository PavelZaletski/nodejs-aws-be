import data from './data';
import { Client } from 'pg';

const { PG_HOST, PG_PORT, PG_DATABASE, PG_USERNAME, PG_PASSWORD } = process.env;
const dbOptions = {
    host: PG_HOST,
    port: PG_PORT,
    database: PG_DATABASE,
    user: PG_USERNAME,
    password: PG_PASSWORD,
    ssl: {
        rejectUnauthorized: false,
    },
    connectionTimeoutMillis: 5000,
};

export const getProducts: any = async () => {
  const client = new Client(dbOptions);
  await client.connect();
  console.log('Connected to DB');

  const ddlResult = await client.query(`
  SELECT * FROM products LEFT JOIN stocks ON products.id = stocks.product_id`);

  console.log('Fetched products from DB - ', ddlResult.rows);

  return Promise.resolve(ddlResult.rows);
}

export const getProductItemById: any = async (id) => {
  const product = data.find(item => item.id === +id);
  return Promise.resolve(product);
}

export const addProductToDb: any = async ({ title, description, price, img }) => {
  const client = new Client(dbOptions);
  await client.connect();
  console.log('Connected to DB');

  const query = {
    text: 'INSERT INTO products(title, description, price, img) VALUES($1, $2, $3, $4)',
    values: [title, description, +price, img],
  };

  const ddlResult = await client.query(query);
  console.log('Saved product to DB - ', ddlResult);
  return Promise.resolve(ddlResult);
}
