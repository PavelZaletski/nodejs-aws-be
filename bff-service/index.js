const express = require('express');
require('dotenv').config();
const axios = require('axios').default;

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.all('/*', (req, res) => {
  console.log('originalUrl', req.originalUrl);
  console.log('method', req.method);
  console.log('body', req.body);

  const recipient = req.originalUrl.split('/')[1];
  console.log('recipient', recipient);

  const recipientUrl = process.env[recipient];
  console.log('recipientUrl', recipientUrl);

  const data = {...(Object.keys(req.body || {}).length > 0 && req.body)};

  if (recipientUrl) {
    const axiosConfig = {
      method: req.method,
      url: `${recipientUrl}${req.originalUrl}`,
      data,
    };

    console.log('axiosConfig:', axiosConfig);

    axios(axiosConfig)
      .then(function(response) {
        console.log('response from recipient', response.data);
        res.json({data2: data, ...response.data});
      })
      .catch(error => {
        console.log('some error: ', JSON.stringify(error));

        if (error.response) {
          const {
            status,
            data
          } = error.response;

          console.log('data', data);

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