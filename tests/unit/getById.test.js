const request = require('supertest');
const fs = require('fs');
const app = require('../../src/app');

describe('GetById /fragments/:_id', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/1').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app)
      .get('/v1/fragments/1')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  // Using a valid username/password pair should give a success result
  test('authenticated users get a fragments array', async () => {
    const res = await request(app).get('/v1/fragments')
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });


  // Testing the id containing .json extension 
  test('return information with the extension in the format specified for the id.', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('content-type', 'application/json');
    const id = postRes.body.fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${id}.json`)
      .auth('user1@email.com', 'password1');
    expect(res.type).toBe('application/json');
  });


  test('authenticated user get fragments list  ?expand=1', async () => {
    const res = await request(app)
      .get('/v1/fragments?expand=1')
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });



  test('authenticated user requests to get with incorrect id', async () => {
    const res = await request(app)
      .get('/v1/fragments/9879')
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(404);
  });



  test('authenticated  user requests of post and get/:id', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is a fragment');

    const getRes = await request(app)
      .get('/v1/fragments/' + postRes.body.fragment.id)
      .auth('user1@email.com', 'password1');
    expect(getRes.statusCode).toBe(200);
  });

  test('authenticated user requests of post to  get/:id.ext from md to html', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/markdown')
      .send('# This is a markdown');

    const getRes = await request(app)
      .get('/v1/fragments/' + postRes.body.fragment.id + '.html')
      .auth('user1@email.com', 'password1');
    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toBe('text/html; charset=utf-8');
  });

  test('authenticated user requests of post to get/:id.ext from png to jpeg', async () => {
    const file = fs.readFileSync('tests/unit/cat1.png');
    const blob = Buffer.from(file);

    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'image/png')
      .send(blob);

    const getRes = await request(app)
      .get('/v1/fragments/' + postRes.body.fragment.id + '.jpg')
      .auth('user1@email.com', 'password1');
    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toBe('image/jpeg');
  });


});

