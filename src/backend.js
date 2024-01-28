const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();
const port = 4000;
const cors = require('cors'); //allowing access from another localhost
app.use(cors());
app.use(bodyParser.json());

const uri = "mongodb+srv://mango:nmFtxBKEFtF75aq0@cluster0.m4wkv23.mongodb.net/?retryWrites=true&w=majority";
let client;
let db;

async function init() {
    client = new MongoClient(uri, {
        serverApi: {
            version: '1',
            strict: true,
            deprecationErrors: true,
        }
    });
    await client.connect();
    db = client.db('task_manager');
}
init();

app.get('/', async (req, res) => {
    try {
        const collection = db.collection('task');
        let data = null;
        if (req.query.category !== 'all') {
            data = await collection.find({ category: req.query.category }).sort({ votes: -1, created_at: -1 }).toArray();
        } else {
            data = await collection.find().sort({ votes: -1, created_at: -1 }).toArray();
        }
        res.json(data);
    } catch (error) {
        console.error('Error retrieving data from MongoDB:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/addFact', async (req, res) => {
    try {
        const newFact = req.body;
        newFact.created_at = new Date();
        newFact.votes = 0;
        const collection = db.collection('task');
        await collection.insertOne(newFact);
        const data = await collection.find().sort({ created_at: -1 }).limit(1).toArray();
        res.json(data);
    } catch (error) {
        console.error('Error retrieving data from MongoDB:', error);
        res.status(500).send('Internal Server Error');
    }
})

app.patch('/updateVotes/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const collection = db.collection('task');
        let fact = await collection.findOne({ _id: new ObjectId(id) }, { votes: true });
        let vote = fact.votes

        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { votes: vote + 1 } }
        );

        if (result.modifiedCount === 1) {
            const data = await collection.find({ _id: new ObjectId(id) }).toArray();
            res.json(data);
        } else {
            res.status(404).json({ success: false, error: 'Fact not found' });
        }
    } catch (error) {
        console.error('Error updating votes in MongoDB:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
})

app.delete('/deleteFact/:_id', async (req, res) => {
    try {
        const id = req.params._id;
        const collection = db.collection('task');
        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 1) {
            res.json({ success: true, message: 'Fact deleted successfully' });
        } else {
            res.status(404).json({ success: false, error: 'Fact not found' });
        }
    } catch (error) {
        console.error('Error deleting fact from MongoDB:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
})

app.listen(port, () => {
    console.log(`Server running on port ${port}.`);
});
