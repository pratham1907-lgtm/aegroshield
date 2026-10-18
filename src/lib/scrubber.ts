/**
 * AegroShield Data Sanitization & Payload Scrubber
 *
 * Ensures all sensitive tokens, authentication headers, database connection strings,
 * credentials, and personal identifiers are scrubbed before logging or sending to telemetry.
 */

const SENSITIVE_KEY_REGEX =
  /^(password|token|secret|apikey|api_key|auth|bearer|credit_card|card_number|cvv|otp|pin|gstin|phone|mobile)$/i;

const DB_CONNECTION_STRING_REGEX =
  /(postgres(?:ql)?|mongodb(?:\+srv)?|mysql):\/\/[^:]+:[^@]+@([^\s"']+)/gi;

const JWT_REGEX =
  /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g;

/**
 * Scrub a string of sensitive connection URLs or JWTs
 */
export function scrubString(str: string): string {
  if (!str || typeof str !== 'string') return str;
  return str
    .replace(DB_CONNECTION_STRING_REGEX, '$1://[SCRUBBED]:[SCRUBBED]@$2')
    .replace(JWT_REGEX, '[SCRUBBED_JWT]');
}

/**
 * Recursively scrub an object or array of sensitive keys and values
 */
export function scrubSensitiveData<T>(data: T): T {
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    return scrubString(data) as unknown as T;
  }

  if (Array.isArray(data)) {
    return data.map((item) => scrubSensitiveData(item)) as unknown as T;
  }

  if (typeof data === 'object') {
    const scrubbed: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (SENSITIVE_KEY_REGEX.test(key)) {
        scrubbed[key] = '[SCRUBBED]';
      } else if (typeof value === 'object' && value !== null) {
        scrubbed[key] = scrubSensitiveData(value);
      } else if (typeof value === 'string') {
        scrubbed[key] = scrubString(value);
      } else {
        scrubbed[key] = value;
      }
    }
    return scrubbed as T;
  }

  return data;
}

/**
 * Remove or sanitize sensitive request headers
 */
export function scrubHeaders(
  headers: Record<string, any> | undefined
): Record<string, any> | undefined {
  if (!headers) return headers;

  const sanitized = { ...headers };
  const sensitiveHeaders = [
    'authorization',
    'cookie',
    'set-cookie',
    'proxy-authorization',
    'x-api-key',
    'apikey',
    'x-auth-token',
  ];

  for (const header of sensitiveHeaders) {
    if (header in sanitized) {
      delete sanitized[header];
    }
    const upper = header.toUpperCase();
    if (upper in sanitized) {
      delete sanitized[upper];
    }
  }

  return sanitized;
}
