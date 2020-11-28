import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'authorization-service',
  },
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    }
  },
  plugins: ['serverless-webpack', 'serverless-dotenv-plugin', 'serverless-pseudo-parameters'],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    stage: 'dev',
    region: 'eu-west-1',
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',

      pavelzaletski: '${env:pavelzaletski}',
    }
  },

  functions: {
    basicAuthorizer: {
      handler: 'handler.basicAuthorizer',
      events: [
        {
          http: {
            method: 'get',
            path: 'import',
          }
        }
      ]
    },
  },
}

module.exports = serverlessConfiguration;
