import test from 'node:test';
import assert from 'node:assert/strict';
import errorMiddleware from '../src/middleware/errorMiddleware.js';

const captureResponse = () => {
  const response = {
    statusCode: null,
    body: null,
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };
  return response;
};

test('maps expired JWTs to 401 so the client can refresh the session', () => {
  const response = captureResponse();

  errorMiddleware({ name: 'TokenExpiredError', message: 'jwt expired' }, {}, response, () => {});

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.message, 'Authentication token expired');
  assert.equal(response.body.error.code, 'TOKEN_EXPIRED');
});

test('maps malformed JWTs to 401', () => {
  const response = captureResponse();

  errorMiddleware({ name: 'JsonWebTokenError', message: 'jwt malformed' }, {}, response, () => {});

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.message, 'Invalid token');
  assert.equal(response.body.error.code, 'INVALID_TOKEN');
});
