[**@codebygarv/express-lens**](../../README.md)

***

[@codebygarv/express-lens](../../README.md) / [index](../README.md) / getPercentiles

# Function: getPercentiles()

> **getPercentiles**(`samples?`): `Percentiles`

Defined in: [index.ts:35](https://github.com/codebygarv/ExpressMonitor/blob/e23879fd3a249d911360fd31d4aac54be25d38bd/index.ts#L35)

Calculate percentiles (p50, p90, p95, p99) for latency samples.

## Parameters

### samples?

`number`[]

Optional latency samples array

## Returns

`Percentiles`

Percentiles object { p50, p90, p95, p99 }
