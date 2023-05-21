const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.njyko.mongodb.net/?retryWrites=true&w=majority`;

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
    client.connect();

    // database and collection/table
    const alltoys = client.db("toytopia").collection("all-toys");

    // all toys data
    app.get("/allToys", async (req, res) => {
      const cursor = alltoys.find();
      const result = await cursor.limit(20).toArray();
      res.send(result);
    });

    // toy details
    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = {
        projection: {
          _id: 1,
          picture: 1,
          toyName: 1,
          sellerName: 1,
          sellerEmail: 1,
          price: 1,
          rating: 1,
          quantity: 1,
          description: 1,
          subCategory: 1,
        },
      };
      const result = await alltoys.findOne(query, options);
      res.send(result);
    });

    // sort by categories
    app.get("/allToys/:text", async (req, res) => {
      let result;
      if (
        req.params.text == "avengers" ||
        req.params.text == "starwars" ||
        req.params.text == "transformers"
      ) {
        result = await alltoys.find({ subCategory: req.params.text }).toArray();
      }
      res.send(result);
    });

    // getting data by queries
    app.get("/mytoy", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { sellerEmail: req.query.email };
      }
      const result = await alltoys.find(query).toArray();
      res.send(result);
    });

    // create a toy
    app.post("/addtoy", async (req, res) => {
      const newToy = req.body;
      const result = await alltoys.insertOne(newToy);
      res.send(result);
    });

    // update toys
    app.patch("/updatetoy/:id", async (req, res) => {
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)};
        const options = { upsert: true };
        const newToy = req.body;
        const updatedToy = {
            $set: {
                toyName: newToy.toyName,
                picture: newToy.picture,
                sellerName: newToy.sellerName,
                sellerEmail: newToy.sellerEmail,
                price: newToy.price,
                subCategory: newToy.subCategory,
                rating: newToy.rating,
                quantity: newToy.quantity,
                description: newToy.description,
            }
        };
        const result = await alltoys.updateOne(filter, updatedToy, options);
        res.send(result);

    });

    // delete data
    app.delete("/toys/:id", async (req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await alltoys.deleteOne(query);
        res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is Running!");
});

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
