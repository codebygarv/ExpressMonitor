# Phase 2 Execution Plan: Stream-Level Body Capture & Smart Truncation

This document details the step-by-step technical plan for **Phase 2**, introducing stream-level payload chunking, safety memory limits, and smart JSON/array formatting.

---

## 🎯 Phase Goals

1. **Zero-Dependency Raw Stream Capture**: Wrap `req.on('data')`, `res.write()`, and `res.end()` to intercept raw HTTP request and response payloads directly from node streams without requiring `express.json()` body-parser middleware.
2. **Smart Payload Truncation**:
   - `maxBodySize`: Maximum raw body bytes to capture before dropping further chunks (default: 1024 bytes). Prevents large payload downloads (images, videos, zip files) from causing memory spikes.
   - `maxDepth`: Maximum JSON nesting depth to format before collapsing inner objects (default: 4).
   - `maxArrayItems`: Maximum array elements to display before truncating (default: 10).
3. **Truncation Transparency**: Add `bodyTruncated: boolean` flag in recorded request entries to indicate when payloads exceed limits.

---

## 📋 Step-by-Step Implementation

### Step 1: Stream Capture Module (`src/core/stream.ts`)
- Implement `captureStreamBody(stream, maxBytes)` utility to safely buffer chunks up to `maxBodySize`.
- *Commit*: `feat: add stream-level body capture module with byte safety guard`

### Step 2: Formatter & Object Truncator (`src/core/formatter.ts`)
- Implement `formatPayload(body, { maxDepth, maxArrayItems })` helper.
- Recursively format JSON payloads while collapsing deep properties and truncating long arrays.
- *Commit*: `feat: add smart JSON payload formatter with maxDepth and maxArrayItems truncation`

### Step 3: Middleware Integration & Options Update
- Wire `maxBodySize`, `maxDepth`, and `maxArrayItems` into middleware options and dashboard recorder.
- *Commit*: `feat: integrate stream body capture and truncation options into middleware`

### Step 4: Unit Test Suite
- Add tests in `test/core/stream.test.js` and `test/core/formatter.test.js`.
- *Commit*: `test: add unit tests for stream capture and body truncation`

---

## 🧪 Verification Plan

- `npm run typecheck` (`tsc --noEmit`)
- `npm test` (`node --import tsx --test test/**/*.test.js`)
- `npm run build` (`tsup`)
