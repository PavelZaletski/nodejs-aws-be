const express = require('express');
require('dotenv').config();
const axios = require('axios').default;

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

const cache = {};

app.all('/*', (req, res) => {
  console.log('originalUrl', req.originalUrl);
  console.log('method', req.method);
  console.log('body', req.body);

  const recipient = req.originalUrl.split('/')[1];
  console.log('recipient', recipient);

  const recipientUrl = process.env[recipient];
  console.log('recipientUrl', recipientUrl);

  if (recipient === 'products' && req.method === 'GET') {
    if (cache.products) {
      res.json(cache.products);
      return;
    }
  }

  if (recipientUrl) {
    const axiosConfig = {
      method: req.method,
      url: `${recipientUrl}${req.originalUrl}`
    };

    if (Object.keys(req.body || {}).length > 0) {
      const data = {...req.body};
      axiosConfig.data = data;
    }

    console.log('axiosConfig:', axiosConfig);

    axios(axiosConfig)
      .then(function(response) {
        console.log('response from recipient', response.data);
        if (!cache.products && recipient === 'products' && req.method === 'GET') {
          cache.products = response.data;
          setTimeout(() => {
            cache.products = null;
          }, 120 * 1000);
        }
        res.json(response.data);
      })
      .catch(error => {
        console.log('some error: ', JSON.stringify(error));

        if (error.response) {
          const {
            status,
            data
          } = error.response;

          res.status(status).json(data);
        } else {
          res.status(500).json({ error: error.message });
        }
      })
      
  } else {
    res.status(502).json({ error: 'Cannot process request' });
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});