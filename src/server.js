import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/movies", async (req, res) => {
  const client = await MongoClient.connect("mongodb://localhost:27017", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = client.db("website");
  const movies = await db.collection("movies").find({}).toArray();

  res.status(200).json(movies);
  client.close();
});

app.get("/api/movies/(:movieId)", async (req, res) => {
  const client = await MongoClient.connect("mongodb://localhost:27017", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = client.db("website");
  const { movieId } = req.params;
  const movie = await db.collection("movies").findOne({ id: movieId });
  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(404).json("Could not find the movie");
  }
  client.close();
});

app.post("/api/movies/add", async (req, res) => {
  const client = await MongoClient.connect("mongodb://localhost:27017", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = client.db("website");
  try {
    const newMovie = req.body;
    console.log(newMovie);
    const result = await db.collection("movies").insertOne(newMovie);
    console.log(result);
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json("Could not create the movie");
    }
  } catch (error) {
    res.status(404).json(`${error.message}`);
  }
  client.close();
});

app.post("/api/movies/mark-seen", async (req, res) => {
  const client = await MongoClient.connect("mongodb://localhost:27017", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = client.db("website");
  try {
    const result = await db.collection("movies").insertOne({
      title: "NathanJms",
      rank: "101",
      id: "tt0239848230548",
      seen: 0,
    });
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json("Could not create the movie");
    }
  } catch (error) {
    res.status(404).json(`${error.message}`);
  }
  client.close();
});

app.listen(8000, () => {
  console.log("Server is listening on port 8000...");
});
