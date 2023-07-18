/* eslint-disable no-tabs */
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
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
