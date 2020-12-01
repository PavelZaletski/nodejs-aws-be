import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'import-service',
    // app and org for use with dashboard.serverless.com
    // app: your-app-name,
    // org: your-org-name,
  },
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    }
  },
  // Add the serverless-webpack plugin
  plugins: ['serverless-webpack', 'serverless-dotenv-plugin'],
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

      PG_HOST: '${env:PG_HOST}',
      PG_PORT: '${env:PG_PORT}',
      PG_DATABASE: '${env:PG_DATABASE}',
      PG_USERNAME: '${env:PG_USERNAME}',
      PG_PASSWORD: '${env:PG_PASSWORD}',
      SQS_URL: {
        Ref: 'SQSQueue',
      },
      SNS_ARN: {
        Ref: 'SNSTopic',
      },
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: 's3:ListBucket',
        Resource: ['arn:aws:s3:::node-in-aws-s3-pz']
      },
      {
        Effect: 'Allow',
        Action: ['s3:*'],
        Resource: ['arn:aws:s3:::node-in-aws-s3-pz/*']
      },
      {
        Effect: 'Allow',
        Action: ['sqs:*'],
        Resource: [
          {
            'Fn::GetAtt': ['SQSQueue', 'Arn'],
          },
        ],
      },
      {
        Effect: 'Allow',
        Action: ['sns:*'],
        Resource: {
          Ref: 'SNSTopic',
        },
      },
    ],
  },

  resources: {
    Resources: {
      SQSQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'catalogItemsQueue',
        }
      },
      SNSTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: 'createProductTopic',
        }
      },
      SNSSubscription: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: 'pavel_zaletski@epam.com',
          Protocol: 'email',
          TopicArn: {
            Ref: 'SNSTopic',
          },
        },
      },
      SNSSubscriptionAdditional: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: 'pavel.zaletski@gmail.com',
          Protocol: 'email',
          TopicArn: {
            Ref: 'SNSTopic',
          },
          FilterPolicy: {
            price: [
              {
                "numeric": [
                  ">=",
                  50
                ]
              }
            ]
          }
        },
      },

      GatewayResponseDenied: {
        Type: 'AWS::ApiGateway::GatewayResponse',
        Properties: {
          ResponseParameters: {
            'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
            'gatewayresponse.header.Access-Control-Allow-Credentials': "'true'",
          },
          ResponseType: 'ACCESS_DENIED',
          RestApiId: {
            Ref: 'ApiGatewayRestApi',
          },
        },
      },

      GatewayResponseUnauthorized: {
        Type: 'AWS::ApiGateway::GatewayResponse',
        Properties: {
          ResponseParameters: {
            'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
            'gatewayresponse.header.Access-Control-Allow-Credentials': "'true'",
          },
          ResponseType: 'UNAUTHORIZED',
          RestApiId: {
            Ref: 'ApiGatewayRestApi',
          },
        },
      },
    },
  },

  functions: {
    importProductsFile: {
      handler: 'handler.importProductsFile',
      events: [
        {
          http: {
            method: 'get',
            path: 'import',
            cors: true,
            authorizer: {
              name: 'basicAuthorizerTest',
              arn: 'arn:aws:lambda:eu-west-1:520291518427:function:authorization-service-dev-basicAuthorizer',
              resultTtlInSeconds: 0,
              identitySource: 'method.request.header.Authorization',
              type: 'token',
            }
          }
        }
      ]
    },

    importFileParser: {
      handler: 'handler.importFileParser',
      events: [
        {
          s3: {
            bucket: 'node-in-aws-s3-pz',
            event: 's3:ObjectCreated:*',
            rules: [
              {
                prefix: 'uploaded/',
                suffix: '.csv',
              }
            ],
            existing: true,
          },
        },
      ],
    },

    catalogBatchProcess: {
      handler: 'handler.catalogBatchProcess',
      events: [
        {
          sqs: {
            batchSize: 5,
            arn: {
              'Fn::GetAtt': ['SQSQueue', 'Arn'],
            }
          }
        }
      ]
    },
  },
}

module.exports = serverlessConfiguration;

