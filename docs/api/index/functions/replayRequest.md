[**@codebygarv/express-lens**](../../README.md)

***

[@codebygarv/express-lens](../../README.md) / [index](../README.md) / replayRequest

# Function: replayRequest()

> **replayRequest**(`requestId`, `fetchFn?`): `Promise`\<`any`\>

Defined in: [index.ts:104](https://github.com/codebygarv/ExpressMonitor/blob/e23879fd3a249d911360fd31d4aac54be25d38bd/index.ts#L104)

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
