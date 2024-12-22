require('dotenv').config()
const ObjectId = require('mongodb').ObjectId;
const express = require('express')
const cors = require('cors')
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1iyz9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const marathonsCollection = client.db('marathonManagementDB').collection('marathons')

      //marathons 
      app.get('/marathons', async(req,res)=>{
        const cursor = marathonsCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      })
      app.get('/marathon', async(req,res)=>{
        const cursor = marathonsCollection.find().limit(6);
        const result = await cursor.toArray();
        res.send(result);
      })

      app.get('/marathon/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await marathonsCollection.findOne(query);
        res.send(result)
      })

      //post API marathon data
      app.post('/marathon', async(req, res)=>{
        const newMarathon = req.body;
        console.log(newMarathon)
        const result = await marathonsCollection.insertOne(newMarathon)
        res.send(result)
      })



    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");



  } finally {
    
  }
}
run().catch(console.dir);


app.get('/', (req, res)=>{
    res.send('marathon platform is ready')

})
app.listen(port, ()=>{
    console.log(`Marathon is Port: ${port}`)
})