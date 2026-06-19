const store = {
  // Overall metrics
  totalRequests: 0,
  totalErrors: 0,
  totalDuration: 0,

  // Status codes
  statusCodes: {
    200: 0,
    201: 0,
    400: 0,
    401: 0,
    404: 0,
    500: 0,
  },

  // Method metrics
  methods: {
    GET: 0,
    POST: 0,
    PUT: 0,
    DELETE: 0,
    PATCH: 0,
    OPTIONS: 0,
  },

  // Route metrics map
  // Key: "GET /users"
  // Value: { count, totalDuration, maxDuration, minDuration }
  routes: new Map(),

  // Recent errors
  recentErrors: [],

  reset() {
    this.totalRequests = 0;
    this.totalErrors = 0;
    this.totalDuration = 0;
    this.statusCodes = { 200: 0, 201: 0, 400: 0, 401: 0, 404: 0, 500: 0 };
    this.methods = { GET: 0, POST: 0, PUT: 0, DELETE: 0, PATCH: 0, OPTIONS: 0 };
    this.routes.clear();
    this.recentErrors = [];
  }
};

module.exports = store;
