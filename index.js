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
  const authHeader = req.headers?.authorization;
  if (!authHeader) {
    return res.status(401).send({ error: "Unauthorization access !!" });
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.USER_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({
        message: "Forbidden access",
      });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    const serviceCollection = client
      .db("tourist-service")
      .collection("services");
    const reviewCollection = client.db("tourist-service").collection("reviews");

    //  --------------- token--------------

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.USER_TOKEN, { expiresIn: "7d" });
      res.send({ token });
    });

    // post

    app.post("/service", async (req, res) => {
      const filter = req.body;
      const result = await serviceCollection.insertOne(filter);
      res.send(result);
    });

    // // -------------------get---------------------

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

    //-----------------get by id---------------

    app.get("/service/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await serviceCollection.findOne(filter);
      res.send(result);
    });

    //-----------------get by id---------------

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await serviceCollection.findOne(filter);
      res.send(result);
    });

    // -----------------Review----------------------

    //  ---------- post-----------

    app.post("/review", async (req, res) => {
      const filter = req.body;
      const result = await reviewCollection.insertOne(filter);
      res.send(result);
    });
    // -----------------------services reviews---------------------------

    app.get("/review", async (req, res) => {
      let filter = {};
      if (req.query?.reviewId) {
        filter = {
          serviceId: req.query?.reviewId,
        };
      }
      const cursor = reviewCollection.find(filter).sort({ $natural: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });

    // -----------------------my reviews   and verify token----------------------------

    app.get("/myreview", varifyJWT, async (req, res) => {
      const user = req.decoded;

      if (user?.email !== req?.query?.email) {
        return res.status(404).send({ error: "Email dosen't match !!" });
      }

      let filter = {};
      if (req.query?.email) {
        filter = {
          email: req.query?.email,
        };
      }

      const cursor = reviewCollection.find(filter).sort({ $natural: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });

    // -------------------get review by id ------------------

    app.get("/myreview/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await reviewCollection.findOne(filter);
      res.send(result);
    });

    // -------------update review----------------------

    app.put("/myreview/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const query = req.body;
      const updateDoc = {
        $set: query,
      };
      const result = await reviewCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // --------------delete---------------

    app.delete("/myreview/:id", async (req, res) => {
      const filter = { _id: ObjectId(req.params.id) };
      const result = await reviewCollection.deleteOne(filter);
      res.send(result);
    });
  } finally {
    //
  }
}
run().catch((error) => console.log(error));

app.get("/", (req, res) => {
  res.send("Hello From MongoDB");
});
app.listen(port, () => console.log("Server up and running", port));
