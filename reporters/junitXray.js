export function generateXrayJUnitXML(data, fileName, fileContent, options) {
  var failures = 0;
  var cases = [];
  var mergedOpts = Object.assign({}, defaultOptions, data.options, options);

  forEach(data.metrics, function (metricName, metric) {
    if (!metric.thresholds) {
      return;
    }
    forEach(metric.thresholds, function (thresholdName, threshold) {
      if (threshold.ok) {
        cases.push(
          '<testcase name="' +
            escapeHTML(metricName) +
            ' - ' +
            escapeHTML(thresholdName) +
            '">' +
            '<system-out><![CDATA[Value registered for ' +
            metricName +
            ' is within the expected values(' +
            thresholdName +
            '). Actual values: ' +
            metricName +
            ' = ' +
            getMetricValue(metric, thresholdName, mergedOpts) +
            ']]></system-out>' +
            '<properties>' +
            '<property name="testrun_comment"><![CDATA[Value registered for ' +
            metricName +
            ' is within the expected values- ' +
            thresholdName +
            ']]></property>' +
            '<property name="test_description"><![CDATA[Threshold for ' +
            metricName +
            ']]></property>' +
            '<property name="test_summary" value="' +
            escapeHTML(metricName) +
            ' - ' +
            escapeHTML(thresholdName) +
            '"/>' +
            '</properties>' +
            '</testcase>',
        );
      } else {
        failures++;
        cases.push(
          '<testcase name="' +
            escapeHTML(metricName) +
            ' - ' +
            escapeHTML(thresholdName) +
            '">' +
            '<failure message="Value registered for ' +
            metricName +
            ' is not within the expected values(' +
            escapeHTML(thresholdName) +
            '). Actual values: ' +
            escapeHTML(metricName) +
            ' = ' +
            getMetricValue(metric, thresholdName, mergedOpts) +
            '" />' +
            '<properties>' +
            '<property name="testrun_comment"><![CDATA[Value registered for ' +
            metricName +
            ' is not within the expected values - ' +
            thresholdName +
            ']]></property>' +
            '<property name="test_description"><![CDATA[Threshold for ' +
            metricName +
            ']]></property>' +
            '<property name="test_summary" value="' +
            escapeHTML(metricName) +
            ' - ' +
            escapeHTML(thresholdName) +
            '"/>' +
            '<property name="testrun_evidence">' +
            '<item name="' +
            fileName +
            '">' +
            fileContent +
            '</item>' +
            '</property>' +
            '</properties>' +
            '</testcase>',
        );
      }
    });
  });

  var name =
    options && options.name ? escapeHTML(options.name) : 'k6 thresholds';

  return (
    '<?xml version="1.0"?>\n<testsuites tests="' +
    cases.length +
    '" failures="' +
    failures +
    '">\n' +
    '<testsuite name="' +
    name +
    '" tests="' +
    cases.length +
    '" failures="' +
    failures +
    '">' +
    cases.join('\n') +
    '\n</testsuite >\n</testsuites >'
  );
}
