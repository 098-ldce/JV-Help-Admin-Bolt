const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files with proper paths for Vercel
// Serve static files - Vercel handles this via routes in vercel.json
app.use(express.static('public'));
app.use('/css', express.static('public/css'));
app.use('/js', express.static('public/js'));
app.use('/assets', express.static('public/assets'));
app.use('/admin', express.static('public/admin'));

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials. Please check your .env file.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// API Routes
app.get('/api/hero-content', async (req, res) => {
    try {
        const lang = req.query.lang || 'en'; // Default to English
        
        const { data, error } = await supabase
            .from('hero_content')
            .select('*')
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ 
                error: 'Failed to fetch hero content',
                fallback: {
                    title: 'JV HELP',
                    subtitle: 'Heal Help Protect'
                }
            });
        }

        // Return data with language-specific content
        const response = {
            id: data.id,
            title: data[`title_${lang}`] || data.title_en || 'JV HELP',
            subtitle: data[`subtitle_${lang}`] || data.subtitle_en || 'Heal Help Protect',
            // Include all language versions for frontend caching
            all_languages: {
                en: {
                    title: data.title_en,
                    subtitle: data.subtitle_en
                },
                hi: {
                    title: data.title_hi,
                    subtitle: data.subtitle_hi
                },
                gu: {
                    title: data.title_gu,
                    subtitle: data.subtitle_gu
                }
            }
        };
        
        res.json(response);
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ 
            error: 'Internal server error',
            fallback: {
                title: 'JV HELP',
                subtitle: 'Heal Help Protect'
            }
        });
    }
});

// Activities content API
app.get('/api/activities-content', async (req, res) => {
    try {
        const lang = req.query.lang || 'en';
        
        const { data, error } = await supabase
            .from('activities')
            .select('*')
            .eq('is_active', true)
            .order('display_order');

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ 
                error: 'Failed to fetch activities content',
                data: []
            });
        }

        // Transform data to include language-specific content
        const transformedData = data.map(item => ({
            id: item.id,
            title: item[`title_${lang}`] || item.title_en,
            description: item[`description_${lang}`] || item.description_en,
            icon_url: item.icon_url,
            category: item.category,
            display_order: item.display_order
        }));

        res.json({
            data: transformedData,
            language: lang,
            total: transformedData.length
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ 
            error: 'Internal server error',
            data: []
        });
    }
});

// Activities gallery API
app.get('/api/activities-gallery', async (req, res) => {
    try {
        const lang = req.query.lang || 'en';
        
        const { data, error } = await supabase
            .from('activities_gallery')
            .select('*')
            .eq('is_active', true)
            .order('display_order');

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ 
                error: 'Failed to fetch activities gallery',
                data: []
            });
        }

        // Transform data and include all images
        const transformedData = data.map(item => {
            const images = [item.image];
            
            // Add additional images if they exist
            for (let i = 1; i <= 5; i++) {
                if (item[`image_lm_${i}`]) images.push(item[`image_lm_${i}`]);
                if (item[`image_LM_${i}`]) images.push(item[`image_LM_${i}`]);
            }
            
            return {
                id: item.id,
                title_en: item.title_en,
                title_hi: item.title_hi,
                title_gu: item.title_gu,
                description_en: item.description_en,
                description_hi: item.description_hi,
                description_gu: item.description_gu,
                category_en: item.category_en,
                category_hi: item.category_hi,
                category_gu: item.category_gu,
                quote_en: item.quote_en,
                quote_hi: item.quote_hi,
                quote_gu: item.quote_gu,
                image: item.image,
                images: images,
                date: item.date,
                display_order: item.display_order,
                created_at: item.created_at,
                stats: {
                    'Beneficiaries': getStatNumber(item.display_order),
                    [getSecondStatLabel(item.display_order)]: getSecondStatNumber(item.display_order),
                    [getThirdStatLabel(item.display_order)]: getThirdStatNumber(item.display_order)
                }
            };
        });

        res.json({
            data: transformedData,
            language: lang,
            total: transformedData.length
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ 
            error: 'Internal server error',
            data: []
        });
    }
});

// Helper functions for gallery stats
function getStatNumber(order) {
    const stats = ['500+', '300+', '50+', '1000+', '200+', '100+'];
    return stats[order - 1] || '100+';
}

function getSecondStatNumber(order) {
    const stats = ['15', '15', '24/7', '365', '5', '100+'];
    return stats[order - 1] || '10';
}

function getSecondStatLabel(order) {
    const labels = ['Locations', 'Schools', 'Response', 'Days', 'Festivals', 'Locations'];
    return labels[order - 1] || 'Locations';
}

function getThirdStatNumber(order) {
    const stats = ['95%', '95%', '90%', '100%', '100%', '85%'];
    return stats[order - 1] || '90%';
}

function getThirdStatLabel(order) {
    const labels = ['Success Rate', 'Success Rate', 'Recovery Rate', 'Organic Feed', 'Satisfaction', 'Survival Rate'];
    return labels[order - 1] || 'Success Rate';
}

// Generic multilingual content API
app.get('/api/content/:table', async (req, res) => {
    try {
        const { table } = req.params;
        const lang = req.query.lang || 'en';
        const id = req.query.id;
        
        let query = supabase.from(table).select('*');
        
        if (id) {
            query = query.eq('id', id);
        }
        
        const { data, error } = await supabase.from(table).select('*');

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ 
                error: `Failed to fetch ${table} content`,
                data: []
            });
        }

        // Transform data to include language-specific content
        const transformedData = data.map(item => {
            const transformed = { ...item };
            
            // Find all multilingual fields and set current language values
            Object.keys(item).forEach(key => {
                if (key.endsWith('_en')) {
                    const baseKey = key.replace('_en', '');
                    transformed[baseKey] = item[`${baseKey}_${lang}`] || item[`${baseKey}_en`] || item[key];
                }
            });
            
            return transformed;
        });

        res.json({
            data: transformedData,
            language: lang,
            total: transformedData.length
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ 
            error: 'Internal server error',
            data: []
        });
    }
});



// User thoughts API endpoints
app.get('/api/user-thoughts', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('user_thoughts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ 
                error: 'Failed to fetch thoughts',
                data: []
            });
        }

        res.json({
            data: data || [],
            total: data ? data.length : 0
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ 
            error: 'Internal server error',
            data: []
        });
    }
});

app.post('/api/user-thoughts', async (req, res) => {
    try {
        const { name, contact_no, thought, language, is_anonymous } = req.body;

        if (!thought || thought.trim() === '') {
            return res.status(400).json({ 
                error: 'Thought content is required' 
            });
        }

        const thoughtData = {
            name: is_anonymous ? null : (name || null),
            contact_no: is_anonymous ? null : (contact_no || null),
            thought: thought.trim(),
            language: language || 'en',
            is_anonymous: is_anonymous || false
        };

        const { data, error } = await supabase
            .from('user_thoughts')
            .insert([thoughtData])
            .select()
            .single();

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ 
                error: 'Failed to save thought' 
            });
        }

        res.status(201).json({
            success: true,
            message: 'Thank you for sharing your thoughts!',
            data: data
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ 
            error: 'Internal server error' 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve admin page
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;