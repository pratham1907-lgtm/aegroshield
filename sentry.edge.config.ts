import * as Sentry from "@sentry/nextjs";
import { scrubHeaders, scrubSensitiveData, scrubString } from "./src/lib/scrubber";

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust sample rate in production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

  debug: false,

  // Scrub sensitive tokens, passwords, and authorization headers before sending
  beforeSend(event, hint) {
    // 1. Scrub sensitive request headers
    if (event.request?.headers) {
      event.request.headers = scrubHeaders(event.request.headers);
    }

    // 2. Scrub sensitive request body payloads
    if (event.request?.data) {
      event.request.data = scrubSensitiveData(event.request.data);
    }

    // 3. Scrub sensitive URL query strings
    if (event.request?.url) {
      event.request.url = scrubString(event.request.url);
    }

    // 4. Scrub extra context
    if (event.extra) {
      event.extra = scrubSensitiveData(event.extra);
    }

    // 5. Categorize edge backend errors
    const errorObj = hint?.originalException as any;
    if (errorObj?.status >= 500) {
      event.level = "error";
      event.tags = {
        ...event.tags,
        critical: "true",
        error_type: "edge_500",
        alert_priority: "P1",
      };
    }

    return event;
  },
});
