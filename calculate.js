import http from 'k6/http';
import { check, sleep, fail } from 'k6';
import { Trend } from 'k6/metrics';

import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

import { expect } from 'https://www.chaijs.com/chai.js';

const EXPECTED_CALCULATE_RESPONSE = {
  numbers: ['5', '2'],
  operation: '2',
  result: '10',
};

const myTrend = new Trend('waiting_time');

const isResponseValid = res =>
  check(
    res,
    {
      'status was 200': r => r.status == 200,
      'valid body': r =>
        expect(JSON.parse(r.body)).to.deep.equal(EXPECTED_CALCULATE_RESPONSE),
    },
    {
      myTag: 'VALID_RESPONSE',
    },
  );

const logResponse = res => {
  console.log(
    `@@@@@ Response metrics @@@@@\n ${JSON.stringify(
      res,
      null,
      2,
    )} \n@@@@@@@@@@`,
  );
};

export const options = {
  //httpDebug: 'full',
  vus: 2,
  iterations: 2,
};

export default function () {
  const res = http.get(
    'http://qatools.ro/api/calculate.php?firstNumber=5&secondNumber=2&operation=2',
  );

  logResponse(res);

  myTrend.add(res.timings.waiting);

  if (!isResponseValid(res)) {
    fail('Invalid response');
  }

  sleep(1);
}

export function handleSummary(data) {
  return {
    'reports/summary.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
