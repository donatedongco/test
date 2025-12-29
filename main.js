// Saweria Proxy Server for Roblox
// Compatible dengan Render.com deployment

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000; // Render menggunakan dynamic PORT

// Enable CORS untuk semua origin
app.use(cors());
app.use(express.json());

// Root endpoint - info
app.get('/', (req, res) => {
    res.json({
        service: 'Saweria Proxy API',
        status: 'running',
        version: '1.0.0',
        endpoints: {
            donations: '/api/donations',
            health: '/health'
        },
        timestamp: new Date().toISOString()
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        uptime: process.uptime(),
        timestamp: new Date().toISOString() 
    });
});

// Main proxy endpoint untuk donations
app.get('/api/donations', async (req, res) => {
    try {
        const afterId = req.query.after_id;
        let url = 'https://donate.kongrbl.com/api/public/receipt';
        
        if (afterId) {
            url += `?after_id=${encodeURIComponent(afterId)}`;
        }

        console.log(`[${new Date().toISOString()}] 📡 Proxying request to: ${url}`);

        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'SaweriaProxy/1.0',
                'Accept': 'application/json'
            }
        });

        // Log response info
        const donationCount = response.data.donations?.length || 0;
        console.log(`[${new Date().toISOString()}] ✅ Success: ${donationCount} donation(s)`);

        // Return clean JSON response dengan proper headers
        res.setHeader('Content-Type', 'application/json');
        res.json(response.data);

    } catch (error) {
        console.error(`[${new Date().toISOString()}] ❌ Error:`, error.message);
        
        // Detailed error response
        const errorResponse = {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        };

        if (error.response) {
            errorResponse.status = error.response.status;
            errorResponse.statusText = error.response.statusText;
        }

        res.status(error.response?.status || 500).json(errorResponse);
    }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('🚀 ================================');
    console.log('🚀 Saweria Proxy Server Started!');
    console.log('🚀 ================================');
    console.log(`📡 Port: ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
    console.log('🚀 ================================');
    console.log('');
});
