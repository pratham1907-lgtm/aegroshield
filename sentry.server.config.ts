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
    if (event.request?.query_string) {
      if (typeof event.request.query_string === "string") {
        event.request.query_string = scrubString(event.request.query_string);
      } else {
        event.request.query_string = scrubSensitiveData(event.request.query_string);
      }
    }

    // 4. Scrub extra context
    if (event.extra) {
      event.extra = scrubSensitiveData(event.extra);
    }

    // 5. Scrub error messages (e.g. database credentials in connection strings)
    if (event.exception?.values) {
      for (const val of event.exception.values) {
        if (val.value) {
          val.value = scrubString(val.value);
        }
      }
    }

    // 6. Alert rule classification & threshold flagging for critical backend errors
    const errorObj = hint?.originalException as any;
    const errorMessage = String(errorObj?.message || "");
    const errorCode = String(errorObj?.code || "");

    const isDatabaseTimeout =
      errorCode === "P1001" || // Can't reach database server
      errorCode === "P1002" || // Database timed out
      errorCode === "P1008" || // Operation timed out
      errorCode === "P2024" || // Connection pool timeout
      /timeout|ETIMEDOUT|ECONNREFUSED|connection closed/i.test(errorMessage);

    const isHttp500 =
      errorObj?.status === 500 ||
      errorObj?.statusCode === 500 ||
      event.contexts?.response?.status_code === 500;

    if (isDatabaseTimeout) {
      event.level = "fatal";
      event.tags = {
        ...event.tags,
        critical: "true",
        error_type: "database_timeout",
        alert_priority: "P1",
      };
      event.fingerprint = ["critical-backend-error", "database_timeout"];
    } else if (isHttp500) {
      event.level = "error";
      event.tags = {
        ...event.tags,
        critical: "true",
        error_type: "http_500",
        alert_priority: "P1",
      };
      event.fingerprint = ["critical-backend-error", "http_500"];
    }

    return event;
  },
});
