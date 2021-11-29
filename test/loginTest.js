// 1. INIT code
import http from 'k6/http';
import { check, fail } from 'k6';
import { Trend } from 'k6/metrics';

import defaultReport from '../reporters/defaultReport.js';

import { expect } from 'chai/chai';
import chaiCheck from '../util/chaiCheck.js';

const testEnvironment = __ENV.environment;

const TEST_NAME = 'loginTest';

// Custom Metrics
// Time To First Byte
const ttfbCarsTrend = new Trend(
  `${testEnvironment.toUpperCase()}_${TEST_NAME}_TTFB`,
);

const isResponseValid = (response, expectedResponseBody) =>
  check(response, {
    'status was 200': r => r.status == 200,
    'valid body': r =>
      chaiCheck(() =>
        expect(JSON.parse(r.body)).to.deep.equal(expectedResponseBody),
      ),
  });

const login = (username, password) =>
  http.post(
    `https://qatools.ro/api/login.php?username=${username}&password=${password}`,
  );

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

//***** k6 EXPORTS *****

export const options = {
  //httpDebug: 'full',
  vus: 10,
  iterations: 10,
};

export default function (accessToken) {
  // 3. VU code
  const loginResponse = login(__ENV.username, __ENV.password);
  ttfbCarsTrend.add(loginResponse.timings.waiting);
  validateLogin(loginResponse);
}

export function handleSummary(data) {
  return defaultReport(data, TEST_NAME);
}
