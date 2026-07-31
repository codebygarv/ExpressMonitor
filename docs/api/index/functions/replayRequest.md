[**@codebygarv/express-lens**](../../README.md)

***

[@codebygarv/express-lens](../../README.md) / [index](../README.md) / replayRequest

# Function: replayRequest()

> **replayRequest**(`requestId`, `fetchFn?`): `Promise`\<`any`\>

Defined in: [index.ts:104](https://github.com/codebygarv/ExpressMonitor/blob/8a9f04d3375a35543410b6a3b17e8947fd21d4b7/index.ts#L104)

Replays a previously captured HTTP request by its ID.

## Parameters

### requestId

`string`

Unique ID of the captured request

### fetchFn?

`any`

Custom fetch implementation

## Returns

`Promise`\<`any`\>

Execution result promise
