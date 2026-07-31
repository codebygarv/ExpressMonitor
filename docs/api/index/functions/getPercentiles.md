[**@codebygarv/express-lens**](../../README.md)

***

[@codebygarv/express-lens](../../README.md) / [index](../README.md) / getPercentiles

# Function: getPercentiles()

> **getPercentiles**(`samples?`): `Percentiles`

Defined in: [index.ts:35](https://github.com/codebygarv/ExpressMonitor/blob/8a9f04d3375a35543410b6a3b17e8947fd21d4b7/index.ts#L35)

Calculate percentiles (p50, p90, p95, p99) for latency samples.

## Parameters

### samples?

`number`[]

Optional latency samples array

## Returns

`Percentiles`

Percentiles object { p50, p90, p95, p99 }
