const { MongoClient } = require('mongodb');

// Reusable MongoDB connection handler
let cachedClient = null;

async function connectToDatabase() {
    if (cachedClient) {
        return cachedClient;
    }

    const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
    const dbName = process.env.DB_NAME || 'AgriMate';

    const client = new MongoClient(mongoUrl, {
        maxPoolSize: 10,
    });

    await client.connect();
    cachedClient = client;
    return client;
}

async function getDatabase() {
    const client = await connectToDatabase();
    return client.db(process.env.DB_NAME || 'AgriMate');
}

module.exports = { connectToDatabase, getDatabase };
