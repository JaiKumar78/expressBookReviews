const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
const SECRET_KEY = 'your_jwt_secret_key';

app.use(express.json());

app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));

// Example login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Here you would normally validate the username and password with your user database
    // For simplicity, let's assume the user is authenticated if username and password are provided
    if (username && password) {
        // Create a token
        const token = jwt.sign({ username: username }, SECRET_KEY, { expiresIn: '1h' });
        // Send the token to the client
        return res.json({ token });
    }
    return res.status(401).json({ message: 'Invalid credentials' });
});

app.use("/customer/auth/*", function auth(req, res, next) {
    // Get the token from the request headers
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }
    // Verify the token
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to authenticate token' });
        }
        // If everything is good, save the request for use in other routes
        req.user = decoded;
        next();
    });
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
