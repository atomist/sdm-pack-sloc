# @atomist/sdm-pack-sloc

[![atomist sdm goals](http://badge.atomist.com/T29E48P34/atomist/sdm-pack-sloc/51053400-0a11-4280-959d-7d2a1ae80344)](https://app.atomist.com/workspace/T29E48P34)
[![npm version](https://img.shields.io/npm/v/@atomist/sdm-pack-sloc.svg)](https://www.npmjs.com/package/@atomist/sdm-pack-sloc)

[Atomist][atomist] software delivery machine (SDM) extension Pack for an Atomist SDM to integrate [sloc](https://www.npmjs.com/package/sloc).

[spring]: https://spring.io/ (Spring)
[spring-boot]: http://spring.io/projects/spring-boot (Spring Boot)

See the [Atomist documentation][atomist-doc] for more information on
what SDMs are and what they can do for you using the Atomist API for
software.

[atomist-doc]: https://docs.atomist.com/ (Atomist Documentation)

## Usage

1. First install the dependency in your SDM project

```
$ npm install @atomist/sdm-pack-sloc
```

2. Install the support

```
import { codeMetrics } from "@atomist/sdm-pack-sloc";

sdm.addExtensionPacks(
  ...
  codeMetrics()
 );
```

3. Add configuration to your client configuration

```
// no configuration needed
```

## Support

General support questions should be discussed in the `#support`
channel in the [Atomist community Slack workspace][slack].

If you find a problem, please create an [issue][].

[issue]: https://github.com/atomist/sdm-pack-sloc/issues

## Development

You will need to install [Node][node] to build and test this project.

[node]: https://nodejs.org/ (Node.js)

### Build and test

Use the following package scripts to build, test, and perform other
development tasks.

Command | Reason
------- | ------
`npm install` | install project dependencies
`npm run build` | compile, test, lint, and generate docs
`npm run lint` | run TSLint against the TypeScript
`npm run compile` | generate types from GraphQL and compile TypeScript
`npm test` | run tests
`npm run autotest` | run tests every time a file changes
`npm run clean` | remove files generated during build

### Release

Releases are handled via the [Atomist SDM][atomist-sdm].  Just press
the 'Approve' button in the Atomist dashboard or Slack.

[atomist-sdm]: https://github.com/atomist/atomist-sdm (Atomist Software Delivery Machine)

---

Created by [Atomist][atomist].
Need Help?  [Join our Slack workspace][slack].

[atomist]: https://atomist.com/ (Atomist - How Teams Deliver Software)
[slack]: https://join.atomist.com/ (Atomist Community Slack)

[atomist]: https://atomist.com/ (Atomist - Development Automation)
[slack]: https://join.atomist.com/ (Atomist Community Slack)
