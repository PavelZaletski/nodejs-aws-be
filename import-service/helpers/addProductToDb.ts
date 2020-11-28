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

const pool = new Pool(dbOptions);

export const addProductToDb: any = async ({ title, description, price, img, count }) => {
  const client = await pool.connect();
  console.log('Connected to DB');
  console.log('title =>', title);
  console.log('description =>', description);
  console.log('price =>', price);
  console.log('img =>', img);
  console.log('count =>', count);

  try {
    await client.query('BEGIN');
    const queryText = 'INSERT INTO products(title, description, price, img) VALUES($1, $2, $3, $4) RETURNING *';
    const res1 = await client.query(queryText, [title, description, +price, img]);
    const savedProduct = res1.rows[0];

    console.log('saved product - ', savedProduct);

    const queryText2 = 'INSERT INTO stocks(product_id, count) VALUES($1, $2) RETURNING *';
    const insertStockValues = [res1.rows[0].id, count]
    const res2 = await client.query(queryText2, insertStockValues);

    const savedCount = res2.rows[0];
    console.log('saved count - ', savedCount);

    await client.query('COMMIT');
    console.log('COMMIT');
    return Promise.resolve({ status: 'success', savedProduct, savedCount });
  } catch (e) {
    console.log('error occured - ', e);
    await client.query('ROLLBACK');
    return Promise.resolve({ status: 'error', errorMessage: e });
  } finally {
    client.release();
  }
}
