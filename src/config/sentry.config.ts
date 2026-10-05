import * as Sentry from "@sentry/react-native";
import Constants from "expo-constants";

const dsn = Constants.expoConfig?.extra?.sentryDsn as string | undefined;

Sentry.init({
  dsn,
  debug: __DEV__,
  tracesSampleRate: 1.0,
  enableAutoSessionTracking: true,
});
