const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const path = require('path');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/kokanswaad', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Connection succeeded");
});

// Define Schema
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    phoneNumber: String,
    password: String
});

const User = mongoose.model('User', userSchema);

const cartItemSchema = new mongoose.Schema({
    name: String,
    quantity: Number,
    price: Number
});

const CartItem = mongoose.model('CartItem', cartItemSchema);

const orderSchema = new mongoose.Schema({
    email: String, // Add the email field
    name: String,
    phoneNumber:Number,
    cartItems: [{
        name: String,
        quantity: Number,
        price: Number
    }],
    totalAmount: Number,
    address: String,
    paymentMode: String,
    tipAmount: Number
});

const Order = mongoose.model('Order', orderSchema);

const app = express();

// Serve static files from the same directory as app.js
app.use(express.static(__dirname));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Route to serve the register page
app.get('/Main', function (req, res) {
    res.sendFile(path.join(__dirname, 'Main.html'));
});

// Route to handle sign up form submission
app.post('/signup', function (req, res) {
    const { firstName, lastName, email, password , phoneNumber } = req.body;

    const newUser = new User({
        firstName: firstName,
        lastName: lastName,
        email: email,
        phoneNumber: phoneNumber , // Save the phoneNumber field
        password: password
    });

    newUser.save()
        .then(user => {
            console.log("User registered successfully:", user);
            res.redirect('/login'); // Redirect to the login page
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error registering user');
        });
});

// Route to serve the login page
app.get('/login', function (req, res) {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Route to handle login form submission
app.post('/login', function (req, res) {
    const { email, password } = req.body;

    // Check if user exists in the database
    User.findOne({ email: email, password: password })
        .then(user => {
            if (user) {
                // User found, redirect to home.html
                res.redirect('/home.html');
            } else {
                // User not found or password incorrect
                res.status(401).send('Invalid email or password');
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error logging in');
        });
});

// Handle POST request to save order data
// Handle POST request to save order data
app.post('/save-order', async (req, res) => {
    const email = req.body.email;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const phoneNumber = req.body.phoneNumber; // Add the mobile number field
    const cartItems = req.body.cartItems;
    const totalAmount = calculateTotalAmount(cartItems);
    const address = req.body.address;
    const paymentMode = req.body.paymentMode;
    const tipAmount = req.body.tipAmount || 0;

    try {
        // Save the order to the database
        const newOrder = new Order({
            email: email,
            name: `${firstName} ${lastName}`,
            phoneNumber: phoneNumber, // Include mobile number in the order
            cartItems: cartItems,
            totalAmount: totalAmount,
            address: address,
            paymentMode: paymentMode,
            tipAmount: tipAmount
        });

        await newOrder.save();

        // Optionally, you can also save individual cart items
        for (const item of cartItems) {
            const newItem = new CartItem({
                name: item.name,
                quantity: item.quantity,
                price: item.price
            });

            await newItem.save();
        }

        res.sendStatus(200); // Send success response
    } catch (error) {
        console.error('Error saving order:', error);
        res.status(500).send('Error saving order data');
    }
});

// Route to serve the user dashboard page
app.get('/home.html', function (req, res) {
    res.sendFile(path.join(__dirname, 'home.html'));
});

// Route to serve the HTML page
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'Main.html'));
});

// Helper function to calculate total amount
function calculateTotalAmount(cartItems) {
    return cartItems.reduce((total, item) => total + item.quantity * item.price, 0);
}

const server = app.listen(1080, '127.0.0.1', function () {
    console.log("Server is listening on http://127.0.0.1:1080");
});
