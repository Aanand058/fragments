// tests/unit/app.test.js

const request = require('supertest');
const app = require('../../src/app');

describe('404 Handler', () => {
  test("404 for resources that can't be found", () =>
    request(app).get('/non-existent-route').expect(404));
});
