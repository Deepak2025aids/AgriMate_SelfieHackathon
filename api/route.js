import { getDatabase } from './_db.js';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const db = await getDatabase();
        const cropsCollection = db.collection('crops');
        const pricesCollection = db.collection('prices');
        const schemesCollection = db.collection('schemes');
        const usersCollection = db.collection('users');

        // Route handling
        const { query, method } = req;

        // Health check
        if (req.url === '/api/health') {
            return res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
        }

        // GET /api/crops - Get all crops
        if (req.url === '/api/crops' && method === 'GET') {
            const crops = await cropsCollection.find({}).toArray();
            return res.status(200).json(crops);
        }

        // GET /api/crops/season - Get crops by season
        if (req.url.includes('/api/crops/season') && method === 'GET') {
            const season = query.season || 'kharif';
            const crops = await cropsCollection.find({ season }).toArray();
            return res.status(200).json(crops);
        }

        // GET /api/prices - Get prices by state/district
        if (req.url.includes('/api/prices') && method === 'GET') {
            const state = query.state || '';
            const district = query.district || '';
            const filter = {};
            if (state) filter.state = { $regex: state, $options: 'i' };
            if (district) filter.district = { $regex: district, $options: 'i' };
            const prices = await pricesCollection.find(filter).toArray();
            return res.status(200).json(prices);
        }

        // POST /api/prices - Add new price entry
        if (req.url === '/api/prices' && method === 'POST') {
            const { crop, price, state, district, date } = req.body;
            if (!crop || !price) {
                return res.status(400).json({ error: 'crop and price are required' });
            }
            const result = await pricesCollection.insertOne({
                crop,
                price,
                state: state || '',
                district: district || '',
                date: date || new Date(),
            });
            return res.status(201).json({ id: result.insertedId });
        }

        // GET /api/schemes - Get all schemes
        if (req.url === '/api/schemes' && method === 'GET') {
            const schemes = await schemesCollection.find({}).toArray();
            return res.status(200).json(schemes);
        }

        // GET /api/schemes/state - Get schemes by state
        if (req.url.includes('/api/schemes/state') && method === 'GET') {
            const state = query.state || '';
            const schemes = await schemesCollection.find({ state }).toArray();
            return res.status(200).json(schemes);
        }

        // GET /api/users/profile - Get user profile
        if (req.url.includes('/api/users/profile') && method === 'GET') {
            const userId = query.id;
            if (!userId) {
                return res.status(400).json({ error: 'id is required' });
            }
            const user = await usersCollection.findOne({ _id: userId });
            return res.status(user ? 200 : 404).json(user || { error: 'User not found' });
        }

        // POST /api/users - Create new user
        if (req.url === '/api/users' && method === 'POST') {
            const { name, email, phone } = req.body;
            if (!name || !email) {
                return res.status(400).json({ error: 'name and email are required' });
            }
            const result = await usersCollection.insertOne({
                name,
                email,
                phone: phone || '',
                createdAt: new Date(),
            });
            return res.status(201).json({ id: result.insertedId });
        }

        // Default: endpoint not found
        return res.status(404).json({ error: 'API endpoint not found' });
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal server error', message: error.message });
    }
}
