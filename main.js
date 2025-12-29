// Simple proxy server untuk Saweria API
// Install: npm install express axios cors
// Run: node proxy.js

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS untuk semua origin
app.use(cors());
app.use(express.json());

// Endpoint proxy
app.get('/api/donations', async (req, res) => {
    try {
        const afterId = req.query.after_id;
        let url = 'https://donate.kongrbl.com/api/public/receipt';
        
        if (afterId) {
            url += `?after_id=${encodeURIComponent(afterId)}`;
        }

        console.log(`[${new Date().toISOString()}] Proxying request to: ${url}`);

        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'SaweriaProxy/1.0'
            }
        });

        // Log response
        console.log(`[${new Date().toISOString()}] Success: ${response.data.donations?.length || 0} donations`);

        // Return clean JSON response
        res.json(response.data);

    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error:`, error.message);
        
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`🚀 Saweria Proxy running on port ${PORT}`);
    console.log(`📡 Endpoint: http://localhost:${PORT}/api/donations`);
    console.log(`❤️  Health: http://localhost:${PORT}/health`);
});
