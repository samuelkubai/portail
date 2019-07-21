import * as Sentry from '@sentry/electron';

class SentryUtility {
  constructor() {
    Sentry.init({ dsn: 'https://457a350bfadc465db05222c1277b2989@sentry.io/1509943' });
  }

  track() {
    console.log('Successfully initialized sentry to track application exceptions');
  }
}

export default (function() {
  let singleInstance = new SentryUtility();

  return {
    instance: singleInstance,
  };
})();
