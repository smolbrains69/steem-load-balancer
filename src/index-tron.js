// Import transaction router
const transactionRouter = require('./transaction-api');

// Existing load balancer functionality...

// Use transaction router
app.use('/transaction', transactionRouter);
