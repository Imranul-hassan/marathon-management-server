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
    const registrationCollection = client.db('marathonManagementDB').collection('registration')

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

      app.get('/registration/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await marathonsCollection.findOne(query);
        res.send(result)
      })

      app.get('/my-marathon/:email', async(req, res)=>{
        const email = req.params.email;
        const query = {email: email}
        const cursor = marathonsCollection.find(query);
        const result = await cursor.toArray();
        res.send(result)
      })

      app.get('/my-marathon/:email/update-marathon/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await marathonsCollection.findOne(query)
        res.send(result)
      })

      app.get('/my-apply/:email', async(req, res)=>{
        const email = req.params.email;
        const query = {email: email}
        const cursor = registrationCollection.find(query);
        const result = await cursor.toArray();
        res.send(result)
      })
      app.get('/my-apply/:email/update-apply/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await registrationCollection.findOne(query)
        res.send(result)
      })

      //post API marathon data
      app.post('/marathon', async(req, res)=>{
        const newMarathon = req.body;
        console.log(newMarathon)
        const result = await marathonsCollection.insertOne(newMarathon)
        res.send(result)
      })

      app.post('/registrations', async(req, res)=>{
        const newRegistration = req.body;
        console.log(newRegistration)
        const result = await registrationCollection.insertOne(newRegistration)
        res.send(result)
      })

      //delete
      app.delete('/marathon/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await marathonsCollection.deleteOne(query);
        res.send(result)
      })

      app.delete('/apply/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await registrationCollection.deleteOne(query);
        res.send(result)
      })

      app.put('/marathon/:id', async(req, res)=>{
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)}
        const options = { upsert: true};
        const updatedMarathon = req.body;
        const marathon = {
          $set: { 
            marathon_title: updatedMarathon.marathon_title, 
            photo: updatedMarathon.photo,
            start_registration_date: updatedMarathon.start_registration_date, 
            end_registration_date: updatedMarathon.end_registration_date, 
            marathon_start_date: updatedMarathon.marathon_start_date, 
            location: updatedMarathon.location,
            running_distance: updatedMarathon.running_distance,
            description: updatedMarathon.description
          }
        }
        const result = await marathonsCollection.updateOne(filter, marathon, options )
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