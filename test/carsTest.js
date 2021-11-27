// 1. INIT code
import http from 'k6/http';
import { check, fail, group, sleep } from 'k6';
import { Trend, Counter } from 'k6/metrics';

import defaultReport from '../reporters/defaultReport.js';

import { expect } from '../node_modules/chai/chai.js';
//import { expect } from 'https://www.chaijs.com/chai.js';

const testEnvironment = __ENV.environment;

const TEST_NAME = 'CARS';
const EXPECTED_CARS = ['Ford Fiesta', 'BMW X5', 'Porsche 911', 'Lamborghini'];

// Custom Metrics
// Time To First Byte
const ttfbCarsTrend = new Trend(
  `${testEnvironment.toUpperCase()}_${TEST_NAME}_TTFB`,
);
// Requests count
const totalRequests = new Counter('TOTAL_REQUESTS');

const isResponseValid = (response, expectedResponseBody) =>
  check(
    response,
    {
      'status was 200': r => r.status == 200,
      // 'valid body': r =>
      //   expect(JSON.parse(r.body)).to.deep.equal(expectedResponseBody),
    },
    {
      myTag: 'VALID_RESPONSE',
    },
  );

const login = (username, password) =>
  http.post(
    `https://qatools.ro/api/login.php?username=${username}&password=${password}`,
  );

const getCars = accessToken => {
  const urlEnv =
    __ENV.environment === 'production' ? '' : `${__ENV.environment}/`;
  return http.get(`https://qatools.ro/api/${urlEnv}cars`, {
    headers: { 'Access-Token': accessToken },
  });
};

const validateLogin = loginResponse => {
  if (!isResponseValid(loginResponse, { status: 'authorized' })) {
    fail('Login failed');
  }
  check(loginResponse, {
    'Access-Token was sent': t =>
      expect(loginResponse.headers['Access-Token']).to.be.a('string').and.not
        .empty,
  });
};

const validateCars = carsResponse => {
  if (!isResponseValid(carsResponse, EXPECTED_CARS)) {
    fail('Getting cars failed');
  }
};

//***** k6 EXPORTS *****

export const options = {
  //httpDebug: 'full',
  vus: 10,
  iterations: 10,
};

export function setup() {
  const loginResponse = login(__ENV.username, __ENV.password);
  totalRequests.add(1);
  validateLogin(loginResponse);

  return loginResponse.headers['Access-Token'];
}

export default function (accessToken) {
  // 3. VU code
  group('CARS', () => {
    const carsResponse = getCars(accessToken);

    ttfbCarsTrend.add(carsResponse.timings.waiting);
    totalRequests.add(1);

    validateCars(carsResponse);

    // logResponse(carsResponse);
  });

  sleep(1);
}

export function teardown(data) {
  // 4. TEARDOWN code
}

export function handleSummary(data) {
  return defaultReport(data, TEST_NAME);
}
