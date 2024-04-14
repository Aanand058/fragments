// tests/unit/get.test.js

const request = require('supertest');

const app = require('../../src/app');
const fs = require('fs');


describe('GET /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users get a fragments array', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  test('successful conversion of html extension to text', async () => {
    const req = await request(app)
      .post('/v1/fragments/')
      .auth('user1@email.com', 'password1')
      .send('<h2> Html </h2>')
      .set('Content-type', 'text/html');

    const res = await request(app)
      .get(`/v1/fragments/${req.body.fragment.id}.txt`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('<h2> Html </h2>');
  });

  test('successful conversion of html extension to text', async () => {
    const req = await request(app)
      .post('/v1/fragments/')
      .auth('user1@email.com', 'password1')
      .send('<h2> This is a html </h2>')
      .set('Content-type', 'text/html');

    const res = await request(app)
      .get(`/v1/fragments/${req.body.fragment.id}.txt`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('<h2> This is a html </h2>');
  });

  test('successful conversion of markdown extension to html', async () => {
    const req = await request(app)
      .post('/v1/fragments/')
      .auth('user1@email.com', 'password1')
      .send('# This is a markdown fragment')
      .set('Content-type', 'text/markdown');

    const res = await request(app)
      .get(`/v1/fragments/${req.body.fragment.id}.html`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.text).toEqual('<h1>This is a markdown fragment</h1>\n');
  });


  test('successful conversion of the existing jpg to webp', async () => {
    const req = await request(app)
      .post('/v1/fragments/')
      .auth('user1@email.com', 'password1')
      .set('Content-type', 'image/jpeg')
      .send(fs.readFileSync(`${__dirname}/images/cat.jpg`));
    expect(req.status).toBe(201);

    const res = await request(app)
      .get(`/v1/fragments/${req.body.fragment.id}.webp`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.type).toBe('image/webp');
  });

  test('successful conversion of the existing jpg to png', async () => {
    const req = await request(app)
      .post('/v1/fragments/')
      .auth('user1@email.com', 'password1')
      .set('Content-type', 'image/jpeg')
      .send(fs.readFileSync(`${__dirname}/images/cat.jpg`));
    expect(req.status).toBe(201);

    const res = await request(app)
      .get(`/v1/fragments/${req.body.fragment.id}.png`)
      .auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.type).toBe('image/png');
  });




});
