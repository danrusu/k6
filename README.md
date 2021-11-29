# k6 performance testing POC

![Performance](https://github.com/danrusu/k6/actions/workflows/performance-test.yml/badge.svg)

### [k6 instalation](https://k6.io/docs/getting-started/installation/)

### Setup

```bash
git clone https://github.com/danrusu/k6.git
cd k6
npm install
```

### Test execution

```bash
npm test
# OR
k6 run -e environment=production -e username=tester -e password=passw0rd test/carsTest.js
```

### [Reports](./reports)

### [Workflows](./.github/workflows)

### [VSCode Github Actions Plugin](https://marketplace.visualstudio.com/items?itemName=cschleiden.vscode-github-actions)
