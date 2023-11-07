
require('dotenv').config();
const express = require('express');
const server = express();
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const cookieParser = require('cookie-parser');

const productsRouter = require('./routes/Product')
const categoriesRouter = require('./routes/Category')
const brandsRouter = require('./routes/Brand')
const usersRouter = require('./routes/User')
const authRouter = require('./routes/Auth')
const cartRouter = require('./routes/Cart')
const ordersRouter = require('./routes/Order');
const { User } = require('./models/User');
const { isAuth, sanitizeUser, cookieExtractor } = require('./services/common');
const path = require('path');



// Webhook
// TODO: we will capture actual order after deploying out server live on public URL

const endpointSecret = process.env.ENDPOINT_SECRET;
server.post('/webhook', express.raw({ type: 'application/json' }), async (request, response) => {
    const sig = request.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
        response.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntentSucceeded = event.data.object;
            console.log({ paymentIntentSucceeded })
            const order = await Order.findById(paymentIntentSucceeded.metadata.orderId)
            order.paymentStatus = 'received'
            await order.save()
            
            // Then define and call a function to handle the event payment_intent.succeeded
            break;
        // ... handle other event types
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
});



// JWT options

const opts = {}
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = process.env.JWT_SECRET_KEY; // TODO : should not be in code


// middlewares
server.use(express.static(path.resolve(__dirname, 'build')))
server.use(cookieParser());
server.use(session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
}));
server.use(passport.authenticate('session'));
server.use(cors({
    exposedHeaders: ['X-Total-Count']
}));
server.use(express.json()); // to parse req.body
server.use('/products', isAuth(), productsRouter.router)
server.use('/category', isAuth(), categoriesRouter.router)
server.use('/brands', isAuth(), brandsRouter.router)
server.use('/user', isAuth(), usersRouter.router)
server.use('/auth', authRouter.router)
server.use('/cart', isAuth(), cartRouter.router)
server.use('/orders', isAuth(), ordersRouter.router)
// this line we add to make react router work in case of other routes doesn't match
server.get('*', (req, res) => res.sendFile(path.resolve('build', 'index.html')));


// Passport Strategy
passport.use('local', new LocalStrategy({
    usernameField: 'email'
}, async function (email, password, next) {
    try {
        const user = await User.findOne({ email });
        console.log(email, password, user);
        if (!user) {
            return next(null, false, { message: 'invalid credentials' })
        }
        crypto.pbkdf2(password, user.salt, 310000, 32, 'sha256', async function (err, hashedPassword) {
            if (!crypto.timingSafeEqual(user.password, hashedPassword)) {
                return next(null, false, { message: 'invalid credentials' })
                // TODO : we will make addresses independent of login
                // res.status(200).json({ id: user.id, role: user.role })
            }
            const token = jwt.sign(sanitizeUser(user), process.env.JWT_SECRET_KEY);
            next(null, { id: user.id, role: user.role, token }); // this lines sends to serializer
        })
    } catch (err) {
        next(err)
    }
}
));

passport.use('jwt', new JwtStrategy(opts, async function (jwt_payload, done) {
    console.log(jwt_payload);
    try {
        const user = await User.findById(jwt_payload.id)
        if (user) {
            return done(null, sanitizeUser(user)); // this calls serializer user
        } else {
            return done(null, false);
        }
    } catch (error) {
        return done(err, false);

    }
}));

// this creates session variable req.user on being called from callbacks
passport.serializeUser(function (user, cb) {
    console.log('serialize', user);
    process.nextTick(function () {
        return cb(null, { id: user.id, role: user.role });
    });
});

// this changes session variable req.user when called from authorized request
passport.deserializeUser(function (user, cb) {
    console.log('deserialize', user);
    process.nextTick(function () {
        return cb(null, user);
    });
});



// Payments
// This is your test secret API key.
const stripe = require("stripe")(process.env.STRIPE_SERVER_KEY);

server.post("/create-payment-intent", async (req, res) => {
    const { totalAmount, orderId } = req.body;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmount * 100, // for decimal compensation
        currency: "inr",
        // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
        automatic_payment_methods: {
            enabled: true,
        },
        metadata: {
            orderId
            // this info will go to stripe => and then to our webhook 
            // so we can conclude that payment was successful, even if client closes window after pay
        }
    });

    res.send({
        clientSecret: paymentIntent.client_secret,
    });
});








const main = async () => {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('database connected');
}
main().catch(err => console.log(err))

// server.get('/', (req, res) => {
//     res.json({ status: 'success' })
// })

server.listen(process.env.PORT, () => {
    console.log(`Node server listening on port no. ${process.env.PORT}`);
})