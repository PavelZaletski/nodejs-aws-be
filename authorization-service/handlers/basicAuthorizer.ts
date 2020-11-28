import 'source-map-support/register';

export const basicAuthorizer = async (event, _context, cb) => {
  console.log('importFileParser =>');

  console.log('Event: ', JSON.stringify(event));

  if (event['type'] !== 'TOKEN') {
    return cb('Unauthorized');
  }

  try {
    const authorizationToken = event.authorizationToken;

    const encodedCreds = authorizationToken.split(' ')[1];
    console.log('encodedCreds =>', encodedCreds);

    const buff = Buffer.from(encodedCreds, 'base64');
    const plainCreds = buff.toString('utf-8').split(':');
    const username = plainCreds[0];
    const password = plainCreds[1];

    console.log(`username: ${username} and password: ${password}`);

    const storedUserPassword = process.env[username];
    const effect = !storedUserPassword || storedUserPassword !== password ? 'Deny' : 'Allow';

    const policy = generatePolicy(encodedCreds, event.methodArn, effect);

    console.log(policy);

    cb(null, policy);
  } catch (e) {
    cb(`Unauthorized: ${e.message}`);
  }
}

function generatePolicy(principalId, resource, effect = 'Allow') {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        }
      ]
    }
  };
}