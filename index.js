require('dotenv').config()
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const ObjectId = require('mongodb').ObjectId;
const express = require('express')
const cors = require('cors')
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

const verifyToken = (req, res, next)=>{
  const token = req.cookies?.token;
  console.log('token inside', token)
  if(!token){
    return res.status(401).send({message: 'Unauthorized access'})
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRETE, (err, decoded)=>{
    if(err){
      return res.status(401).send({message: 'Unauthorized access'})
    }
    req.user = decoded;
    next()
  })
}

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

    //auth related APIs
    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRETE, { expiresIn: '5h' })

      res
        .cookie('token', token, {
          httpOnly: true,
          secure: false
        })
        .send({ success: true })
    })

    app.post('/logout', (req, res) => {
      res
        .clearCookie('token', {
          httpOnly: true,
          secure: false
        })
        .send({ success: true })
    })

    //marathons related APIs
    app.get('/marathons', async (req, res) => {
      const { sort } = req.query;
      let sortOrder = { createdAt: -1 };
      if (sort === 'asc') {
        sortOrder = { createdAt: 1 };
      }
      const cursor = marathonsCollection.find().sort(sortOrder);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/marathon', async (req, res) => {
      const cursor = marathonsCollection.find().limit(6);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/marathon/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await marathonsCollection.findOne(query);
      res.send(result)
    })

    app.get('/registration/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await marathonsCollection.findOne(query);
      res.send(result)
    })

    app.get('/my-marathon/:email', verifyToken,  async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      if(req.user.email !== req.params.email){
        return res.status(403)
      }
      const cursor = marathonsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result)
    })

    app.get('/my-marathon/:email/update-marathon/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await marathonsCollection.findOne(query)
      res.send(result)
    })

    app.get('/my-apply/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      const cursor = registrationCollection.find(query);
      const result = await cursor.toArray();
      res.send(result)
    })

    app.get('/my-apply/:email', async (req, res) => {
      const email = req.params.email;
      const search = req.query.search || '';
      console.log(search)
      const query = {
        email,
        $or: [
          { marathonTitle: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
        ],
      };
      const cursor = registrationCollection.find(query);
      const result = await cursor.toArray();
      res.send(result)
    })

    app.get('/my-apply/:email/update-apply/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await registrationCollection.findOne(query)
      res.send(result)
    })

    //post API marathon data
    app.post('/marathon', async (req, res) => {
      const newMarathon = req.body;
      console.log(newMarathon)
      const result = await marathonsCollection.insertOne(newMarathon)
      res.send(result)
    })

    app.post('/registrations', async (req, res) => {
      const newRegistration = req.body;
      console.log(newRegistration)
      const result = await registrationCollection.insertOne(newRegistration)

      const filter = { _id: new ObjectId(newRegistration.marathonId) }
      const update = {
        $inc: { total_registration_count: 1 }
      }
      const updateCount = await marathonsCollection.updateOne(filter, update)
      res.send(result)
    })

    //delete
    app.delete('/marathon/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await marathonsCollection.deleteOne(query);
      res.send(result)
    })

    app.delete('/apply/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await registrationCollection.deleteOne(query);
      res.send(result)
    })

    app.put('/marathon/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
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
      const result = await marathonsCollection.updateOne(filter, marathon, options)
      res.send(result)
    })

    app.put('/registration/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updateRegistration = req.body;
      const apply = {
        $set: {
          marathonTitle: updateRegistration.marathonTitle,
          marathonStartDate: updateRegistration.marathonStartDate,
          firstName: updateRegistration.firstName,
          lastName: updateRegistration.lastName,
          contactNumber: updateRegistration.contactNumber,
          additionalInfo: updateRegistration.additionalInfo
        }
      }
      const result = await registrationCollection.updateOne(filter, apply, options)
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");



  } finally {

  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('marathon platform is ready')

})
app.listen(port, () => {
  console.log(`Marathon is Port: ${port}`)
})