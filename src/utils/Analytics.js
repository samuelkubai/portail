'use strict';

import firstRun from 'first-run';
import Insight from 'insight';
import { parse } from 'semver';
import pkg from '../../package';

const trackingCode = 'UA-114847636-2';
const insight = new Insight({ trackingCode, pkg });
const version = parse(pkg.version);

const track = (...paths) => {
  console.log('Tracking', `v${version.major}.${version.minor}`, ...paths);
  insight.track(`v${version.major}.${version.minor}`, ...paths);
};

const initializeAnalytics = () => {
  if (firstRun()) {
    insight.track('install');
  }

  if (firstRun({ name: `${pkg.name}-${pkg.version}` })) {
    track('install');
  }
};

module.exports = {
  initializeAnalytics,
  track,
};
