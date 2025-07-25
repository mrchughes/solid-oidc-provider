const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const flash = require('express-flash');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const config = require('./config');
const oidcConfig = require('./config/oidc');
const sessionTimeoutMiddleware = require('./middleware/sessionTimeout');
const flashMiddleware = require('./middleware/flash');
const { checkAuth } = require('./middleware/auth');
const { csrfProtection } = require('./middleware/csrf');
const { getProvider } = require('./utils/oidc-bridge');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const consentRoutes = require('./routes/consent');
const profileRoutes = require('./routes/profile');

// Express application
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));
app.use(methodOverride('_method')); // For handling PUT/DELETE in forms

// Session management
app.use(session({
    secret: config.cookieSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: config.security.sessionTimeout
    }
}));

// Flash messages
app.use(flash());
app.use(flashMiddleware);

// Set up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');
app.use(expressLayouts);

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Serve static files
app.use('/assets', express.static(path.join(__dirname, '..', 'public', 'assets'), {
    maxAge: 86400000 // 1 day
}));

// Check authentication status for all routes
app.use(checkAuth);


// Initialize OIDC Provider
const initializeOIDC = async () => {
    try {
        console.log('Starting OIDC initialization...');
        // Get Provider from the bridge
        const Provider = await getProvider();
        console.log('Provider loaded successfully!');

        // Create OIDC provider instance with default configuration
        // The OIDC provider will generate its own keys
        console.log('Creating OIDC provider instance...');
        const oidc = new Provider(config.issuer, oidcConfig);
        console.log('OIDC provider created successfully!');

        // Add middleware to set path for all routes
        app.use((req, res, next) => {
            res.locals.path = req.path;
            next();
        });

        // Add route to serve JWKS at /jwks.json
        app.get('/jwks.json', async (req, res) => {
            const jwks = await oidc.jwks();
            res.json(jwks);
        });

        // Add a simple route for the root path for health checks
        app.get('/', (req, res) => {
            res.render('index', {
                title: 'Welcome to Solid OIDC Provider',
                user: req.session.user || null
            });
        });

        // Login page route
        app.get('/login', (req, res) => {
            if (req.session.user) {
                return res.redirect('/profile');
            }
            res.render('login', {
                title: 'Login',
                errors: null,
                email: ''
            });
        });

        // Registration page route
        app.get('/register', (req, res) => {
            if (req.session.user) {
                return res.redirect('/profile');
            }
            res.render('register', {
                title: 'Register',
                errors: null,
                user: {}
            });
        });

        // Session timeout middleware - add after session is initialized but before routes
        app.use(sessionTimeoutMiddleware);

        // Make user info available to all views
        app.use((req, res, next) => {
            res.locals.user = req.session.user || null;
            next();
        });

        // Use custom routes for OIDC provider
        app.use('/', authRoutes);
        app.use('/', userRoutes);
        app.use('/', profileRoutes);

        // Mount OIDC provider
        app.use('/', oidc.callback());

        return oidc;
    } catch (error) {
        console.error('OIDC initialization failed:', error);
        throw error;
    }
};

// Start server
const startServer = async () => {
    try {
        console.log('Starting server...');
        const oidc = await initializeOIDC();

        // Start listening
        const server = app.listen(config.port, () => {
            console.log(`Solid OIDC Provider running on port ${config.port}`);
            console.log(`Environment: ${config.env}`);
            console.log(`Base URL: ${config.issuer}`);
        });

        // Handle graceful shutdown
        const gracefulShutdown = async (signal) => {
            console.log(`Received ${signal}, shutting down gracefully...`);

            // Close the HTTP server first
            server.close(() => {
                console.log('HTTP server closed');
                // Perform any cleanup operations here
                console.log('Graceful shutdown completed');
                process.exit(0);
            });

            // Set a timeout for the graceful shutdown
            setTimeout(() => {
                console.error('Forced shutdown after timeout');
                process.exit(1);
            }, 10000); // 10 seconds timeout
        };

        // Listen for termination signals
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        return { server, oidc };
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Export for testing
module.exports = { app, startServer };

// Start server if this file is executed directly
if (require.main === module) {
    startServer();
}
