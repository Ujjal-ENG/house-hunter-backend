/* eslint-disable no-tabs */
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import { MongoClient, ServerApiVersion } from 'mongodb';
// config setup
dotenv.config();

// PORT
const PORT = process.env.PORT || 8080;

// app setup
const app = express();

// default middleware
app.use(express.json());
app.use(cors());

// default routes
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Hello From House Hunter Server!!' });
});

// check Health routes
app.get('/health', (req, res) => {
    res.status(200).json({ message: 'server health is good!!' });
});

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.zzrczzq.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        // collection and db name
        const userCollections = client.db('HouseHunter').collection('Users');
        const houseCollections = client.db('HouseHunter').collection('Houses');

        // json web token
        app.post('/jwt', (req, res) => {
            try {
                const user = req.body;
                const token = jwt.sign(user, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });
                res.json({ token });
            } catch (error) {
                console.log(error);
            }
        });

        // verify admin
        const verifyOwner = async (req, res, next) => {
            try {
                const { email } = req.user;
                const user = await userCollections.findOne({ email });
                if (user?.role !== 'owner') {
                    return res.status(403).json({
                        success: false,
                        message: 'Forbidden Access!!',
                    });
                }
                next();
            } catch (error) {
                res.status(200).json({
                    success: false,
                    message: 'Internal Server Error',
                    error: error.message,
                });
            }
        };

        // verify students
        const verifyRenter = async (req, res, next) => {
            try {
                const { email } = req.user;
                const user = await userCollections.findOne({ email });
                if (user?.role !== 'renter') {
                    return res.status(403).json({
                        success: false,
                        message: 'Forbidden Access!!',
                    });
                }
                next();
            } catch (error) {
                res.status(200).json({
                    success: false,
                    message: 'Internal Server Error',
                    error: error.message,
                });
            }
        };

        // user registration
        // register user
        app.post('/user', async (req, res) => {
            try {
                const { email } = req.body;
                const isExistUser = await userCollections.findOne({ email });
                if (isExistUser) {
                    return res.send({ message: 'Email is Already Exists!!' });
                }

                const user = await userCollections.insertOne({ ...req.body });
                res.status(200).json({
                    success: true,
                    message: 'Successfully added!!',
                    data: user,
                });
            } catch (error) {
                res.status(200).json({
                    success: false,
                    message: 'Internal Server error from User POST Request!!',
                });
            }
        });

        // login user
        app.post('/login', async (req, res) => {
            try {
                const { email, password } = req.body;
                console.log(email, password);
                const isExistUser = await userCollections.findOne({ email });
                if (!isExistUser || isExistUser.password !== password) {
                    return res.status(401).json({
                        success: false,
                        message: 'Unauthorized Access',
                    });
                }
                res.status(200).json({
                    success: true,
                    message: 'Successfully LoggedIn',
                });
            } catch (error) {
                res.status(200).json({
                    success: false,
                    message: 'Internal Server error from User Login Request!!',
                });
            }
        });
        // Send a ping to confirm a successful connection
        await client.db('admin').command({ ping: 1 });
        console.log('Pinged your deployment. You successfully connected to MongoDB!');
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

// server listen and PORT
app.listen(PORT, () => {
    console.log('Server is running on PORT 8080');
});
