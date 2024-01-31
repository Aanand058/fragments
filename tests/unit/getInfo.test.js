const request = require('supertest');

const app = require('../../src/app');

describe('GetInfo /fragments/:_id/info', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/1/info').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app)
      .get('/v1/fragments/1/info')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));


  // Using a valid username/password pair should give a success result
  test('authenticated users get a fragment', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'text/plain');
    const id = postRes.body.fragment.id;
    const res = await request(app)
      .get(`/v1/fragments/${id}/info`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
  });




  // get 404 for non existing fragment
  test('get 404 for non existing fragment', async () => {
    const res = await request(app)
      .get(`/v1/fragments/1/info`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(404);
  });


});
