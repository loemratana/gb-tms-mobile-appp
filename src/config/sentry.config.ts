import * as Sentry from "@sentry/react-native";
import Constants from "expo-constants";

const dsn = Constants.expoConfig?.extra?.sentryDsn as string | undefined;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  // `debug: true` logs every event/breadcrumb to the console, and in development every
  // console call is shipped to Metro — that made the whole app feel sluggish.
  debug: false,
  // Performance tracing instruments every navigation and touch. Off in development;
  // sample a fraction in release builds, which is plenty to spot slow screens.
  tracesSampleRate: __DEV__ ? 0 : 0.2,
  enableAutoSessionTracking: true,
});
