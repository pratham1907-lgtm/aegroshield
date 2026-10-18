# AegroShield Pilot Operations & Monitoring Guide

## 1. Overview
This document specifies the operational observability, alerting thresholds, and data protection policies for the AegroShield pilot launch.

---

## 2. Health & Uptime Endpoints
- **Endpoint**: `/api/health`
- **Supported HTTP Methods**: `GET`, `HEAD`
- **Caching**: `Cache-Control: no-store, no-cache, must-revalidate` (Bypasses CDN/proxy caching)

### Responses
- **Healthy (HTTP 200 OK)**:
  ```json
  {
    "status": "ok",
    "database": "connected",
    "latencyMs": 14,
    "uptime": 3600,
    "timestamp": "2026-10-18T17:15:00.000Z"
  }
  ```
- **Degraded (HTTP 503 Service Unavailable)**:
  ```json
  {
    "status": "degraded",
    "database": "disconnected",
    "error": "Database unavailable",
    "latencyMs": 5002,
    "timestamp": "2026-10-18T17:15:05.000Z"
  }
  ```

---

## 3. Sentry Alert Rules & Escalation Thresholds

| Alert Level | Trigger Condition | Threshold | Notification Route |
| :--- | :--- | :--- | :--- |
| **P1 Critical: DB Timeout** | `error_type: database_timeout` or `level: fatal` | **1 event** (Instant) | On-Call Pager, Email, `#alerts-p1-critical` |
| **P1 Critical: Health Degraded** | `endpoint: /api/health` & `critical: true` | **1 event** (Instant) | On-Call Pager, `#alerts-p1-critical` |
| **P2 High: HTTP 500 Spike** | `error_type: http_500` | **>5 events in 5m** | `#alerts-backend` Slack |
| **P3 Medium: Client Errors** | Unhandled frontend exceptions | **>20 events in 15m** | Daily digest to Frontend team |

---

## 4. Privacy & Payload Scrubbing Policy
All Sentry client, server, and edge configs execute pre-transmission scrubbing (`beforeSend`):
1. **Headers Scrubbed**: `authorization`, `cookie`, `set-cookie`, `proxy-authorization`, `x-api-key`, `apikey`.
2. **Body & Extra Payload Keys Scrubbed**: Any key matching `password`, `token`, `secret`, `apiKey`, `auth`, `bearer`, `credit_card`, `cvv`, `otp`, `pin`, `gstin`, `phone`, `mobile`.
3. **Connection Strings & Secrets**: Database connection strings matching `postgres://...`, `mongodb://...` are masked before logging or telemetry ingestion.
