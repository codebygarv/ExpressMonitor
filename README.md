# express-lens

A lightweight, plug-and-play monitoring package for Express.js applications. It silently tracks your application's metrics and logs a concise analytics summary inline to the console for every HTTP request.

## Features

- **Zero setup**: Just plug it into your Express app as a middleware.
- **Inline Analytics Logs**: View realtime metrics for every request without any dashboards getting in the way.
- **Performance Tracking**: Measures response times, average request durations, and memory (RSS) usage.
- **Error Tracking**: Keeps a tally of request errors (HTTP 400+).

## Installation

You can install `express-lens` using npm or yarn:

```bash
npm install express-lens
```

```bash
yarn add express-lens
```

## Usage

Simply require the middleware and add it to your Express app before declaring your routes.

```javascript
const express = require('express');
const monitor = require('express-lens');

const app = express();

// Add the monitor middleware
app.use(monitor());

// Your routes
app.post('/users', (req, res) => {
  res.status(201).json({ message: 'User created' });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```

When a request hits your server, you will see a log similar to this in your console:

## Configuration

The `monitor` middleware takes an optional configuration object.

```javascript
app.use(monitor({
  logAnalytics: true // Default is true. Set to false to disable console logging.
}));
```

## License

MIT

Developed by github/codebygarv
