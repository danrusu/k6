import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import {
  textSummary,
  jUnit,
} from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

export default function defaultReport(data, reportName) {
  const reportFolder = 'reports';
  const htmlReportFile = `${reportFolder}/${reportName}.html`;
  const junitReportFile = `${reportFolder}/${reportName}_junit.xml`;
  return {
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
    [htmlReportFile]: htmlReport(data),
    [junitReportFile]: jUnit(data),
  };
}
