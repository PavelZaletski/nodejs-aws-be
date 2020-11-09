import data from './data';
import { Client } from 'pg';
import { Pool } from 'pg';

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

export const addProductToDb: any = async ({ title, description, price, img, count }) => {
  const pool = new Pool(dbOptions);
  const client = await pool.connect()
  console.log('Connected to DB');

  let result;

  try {
    await client.query('BEGIN')
    const queryText = 'INSERT INTO products(title, description, price, img) VALUES($1, $2, $3, $4) RETURNING *';
    const res1 = await client.query(queryText, [title, description, +price, img]);
    const savedProduct = res.rows && res.rows[0];

    console.log('saved product - ', savedProduct);

    const queryText2 = 'INSERT INTO stocks(product_id, count) VALUES($1, $2) RETURNING *';
    const insertStockValues = [res.rows[0].id, count]
    const res2 = await client.query(queryText2, insertStockValues);

    const savedCount = res2.rows && res2.rows[0];
    console.log('saved count - ', savedCount);

    await client.query('COMMIT');
    console.log('COMMIT');
    result = { savedProduct, savedCount };
  } catch (e) {
    console.log('error occured - ', e);
    await client.query('ROLLBACK');
    result = { error: e };
  } finally {
    console.log('client release');
    client.release();
    Promise.resolve({ result });
  }
}
