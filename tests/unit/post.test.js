const request = require('supertest');
const app = require('../../src/app');

const { readFragment } = require('../../src/model/data');

describe('POST /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).post('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).post('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array 
  // creating a plain fragment
  test('authenticated users post a fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .send('This is a fragment')
      .set('Content-type', 'text/plain')
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
  });

  // Using a not supported Content-Type should give an error code
  test('authenticated users post not supported  fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .send('This is fragment')
      .set('Content-type', 'image/png')
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(415);
    expect(res.body.status).toBe('error');
  });

  // responses include all necessary and expected properties
  test('responses include all necessary and expected properties', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .send('This is fragment')
      .set('Content-type', 'text/plain')
      .auth('user1@email.com', 'password1');
    const fragment = await readFragment(res.body.fragment.ownerId, res.body.fragment.id);
    expect(res.body.fragment).toEqual(fragment);
  });

  //POST response includes Location header with full URL
  test('POST response includes Location header with full URL', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .send('This is fragment')
      .set('Content-type', 'text/plain')
      .auth('user1@email.com', 'password1');
    expect(res.headers['location']).toBe(`${process.env.API_URL}/v1/fragments/${res.body.fragment.id}`);
  });

});
