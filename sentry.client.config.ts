import * as Sentry from "@sentry/nextjs";
import { scrubHeaders, scrubSensitiveData, scrubString } from "./src/lib/scrubber";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust sample rate in production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  debug: false,

  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,

  // Scrub sensitive tokens, passwords, and authorization headers before sending
  beforeSend(event) {
    if (event.request?.headers) {
      event.request.headers = scrubHeaders(event.request.headers);
    }

    if (event.request?.data) {
      event.request.data = scrubSensitiveData(event.request.data);
    }

    if (event.request?.url) {
      event.request.url = scrubString(event.request.url);
    }

    if (event.extra) {
      event.extra = scrubSensitiveData(event.extra);
    }

    return event;
  },
});
