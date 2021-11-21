// 1. INIT code
import http from 'k6/http';
import { check, fail, group, sleep } from 'k6';
import { Trend, Counter } from 'k6/metrics';

import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import {
  textSummary,
  jUnit,
} from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

import { expect } from '../node_modules/chai/chai.js';
//import { expect } from 'https://www.chaijs.com/chai.js';

const EXPECTED_CARS = ['Ford Fiesta', 'BMW X5', 'Porsche 911', 'Lamborghini'];

// Custom Metrics
// Time To First Byte
const ttfbLoginTrend = new Trend('LOGIN_TTFB');
const ttfbCarsTrend = new Trend('CARS_TTFB');
// Requests count
const totalRequests = new Counter('TOTAL_REQUESTS');

const isResponseValid = (response, expectedResponseBody) =>
  check(
    response,
    {
      'status was 200': r => r.status == 200,
      'valid body': r =>
        expect(JSON.parse(r.body)).to.deep.equal(expectedResponseBody),
    },
    {
      myTag: 'VALID_RESPONSE',
    },
  );

const logResponse = response => {
  console.log(
    `@@@@@ Response metrics @@@@@\n ${JSON.stringify(
      response,
      null,
      2,
    )} \n@@@@@@@@@@`,
  );
};

const login = (username, password) =>
  http.post(
    `https://qatools.ro/api/login.php?username=${username}&password=${password}`,
  );

const getCars = accessToken =>
  http.get(`https://qatools.ro/api/cars`, {
    headers: { 'Access-Token': accessToken },
  });

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
  // 2. SETUP code
}

export default function () {
  // 3. VU code
  let accessToken;
  group('LOGIN', () => {
    const loginResponse = login('tester', 'passw0rd');

    ttfbLoginTrend.add(loginResponse.timings.waiting);
    totalRequests.add(1);

    accessToken = loginResponse.headers['Access-Token'];

    validateLogin(loginResponse);

    // logResponse(loginResponse);
  });

  group('CARS', () => {
    const carsResponse = getCars(accessToken);

    ttfbCarsTrend.add(carsResponse.timings.waiting);
    totalRequests.add(1);

    validateCars(carsResponse);

    // logResponse(carsResponse);
  });

  sleep(1);
}

export function handleSummary(data) {
  return {
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
    'reports/summary.html': htmlReport(data),
    'reports/junit.xml': jUnit(data),
    'reports/report.json': JSON.stringify(data, null, 2),
  };
}

export function teardown(data) {
  // 4. TEARDOWN code
}
