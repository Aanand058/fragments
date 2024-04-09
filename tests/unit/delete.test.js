const request = require('supertest');
const app = require('../../src/app');

test('authenticated user request of post to delete/:id', async () => {
  const postRes = await request(app)
    .post('/v1/fragments')
    .auth('user1@email.com', 'password1')
    .set('Content-Type', 'text/plain')
    .send('This is a test');


  const deleteFrag = await request(app)
    .delete('/v1/fragments/' + postRes.body.fragment.id)
    .auth('user1@email.com', 'password1');
  expect(deleteFrag.statusCode).toBe(200);
});

test('unauthenticated user request to delete', async () => {
  const deleteFrag = await request(app)
    .delete('/v1/fragments/dcdncd')
    .auth('wsscscu@email.com', 'passwsazsord1');
  expect(deleteFrag.statusCode).toBe(401);
});

test('authenticated user request to delete with incorrect ID', async () => {
  const deleteFrag = await request(app)
    .delete('/v1/fragments/sdicjsdij')
    .auth('user1@email.com', 'password1');
  expect(deleteFrag.statusCode).toBe(404);
});


