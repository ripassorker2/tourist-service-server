const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
require("dotenv").config();
const app = express();
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASSWORD}@cluster0.gvjclco.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function varifyJWT(req, res, next) {
  const authHeader = req?.headers?.authorization;
  if (!authHeader) {
    return res.status(404).send({ error: "Unauthorization access !!" });
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.USER_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(402).send({
        message: "Forbidden access",
      });
    }
    req.decoded = decoded;
  });

  next();
}

async function run() {
  try {
    const serviceCollection = client
      .db("tourist-service")
      .collection("services");
    // const orderCollection = client.db("travel-spots").collection("order");

    // token

    // app.post("/jwt", (req, res) => {
    //   const user = req.body;
    //   console.log(user);
    //   const token = jwt.sign(user, process.env.USER_TOKEN, { expiresIn: "7d" });
    //   res.send({ token });
    // });

    // post

    app.post("/service", async (req, res) => {
      const filter = req.body;
      const result = await serviceCollection.insertOne(filter);
      res.send(result);
    });

    // // get

    app.get("/service", async (req, res) => {
      const filter = {};
      const cursor = serviceCollection.find(filter);
      const service = await cursor.limit(3).toArray();
      res.send(service);
    });
    app.get("/services", async (req, res) => {
      const filter = {};
      const cursor = serviceCollection.find(filter);
      const service = await cursor.toArray();
      res.send(service);
    });

    // //get by id

    // app.get("/place/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const filter = { _id: ObjectId(id) };
    //   const result = await placeCollection.findOne(filter);
    //   res.send(result);
    // });

    // // delete

    // app.delete("/place/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const filter = { _id: ObjectId(id) };
    //   const result = await placeCollection.deleteOne(filter);
    //   res.send(result);
    // });

    // // update

    // app.patch("/place/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const filter = { _id: ObjectId(id) };
    //   const query = req.body;
    //   const updateDoc = {
    //     $set: query,
    //   };
    //   const result = await placeCollection.updateOne(filter, updateDoc);
    //   res.send(result);
    // });

    // -----------------Order ----------------------
    //   post

    // app.post("/orders", async (req, res) => {
    //   const filter = req.body;
    //   const result = await orderCollection.insertOne(filter);
    //   res.send(result);
    // });

    // // get
    // app.get("/orders", varifyJWT, async (req, res) => {
    //   const user = req.decoded;
    //   // console.log(user);

    //   const filter = {
    //     email: req.query.email,
    //   };
    //   if (user?.email !== req?.query?.email) {
    //     return res.status(404).send({ error: "Unauthorization access !!" });
    //   }

    //   const cursor = orderCollection.find(filter);
    //   const result = await cursor.toArray();
    //   res.send(result);
    // });
    // app.get("/orders/:id", async (req, res) => {
    //   const filter = { _id: ObjectId(req.params.id) };
    //   const cursor = orderCollection.find(filter);
    //   const result = await cursor.toArray();
    //   res.send(result);
    // });

    // app.delete("/orders/:id", async (req, res) => {
    //   const filter = { _id: ObjectId(req.params.id) };
    //   const result = await orderCollection.deleteOne(filter);
    //   res.send(result);
    // });
  } finally {
    //
  }
}
run().catch((error) => console.log(error));

app.get("/", (req, res) => {
  res.send("Hello From MongoDB");
});
app.listen(port, () => console.log("Server up and running", port));
