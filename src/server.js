import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const baseURL =
  process.env.MONGO_USER && process.env.MONGO_PASS
    ? `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.e8xrb.mongodb.net/${process.env.MONGO_DBNAME}?retryWrites=true&w=majority`
    : "mongodb://localhost:27017";

app.get("/api/movies", async (req, res) => {
  var limit = 0;
  if (req.query.limit && req.query.limit > 0) {
    var limit = parseInt(req.query.limit);
  }
  const client = await MongoClient.connect(baseURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = client.db(process.env.MONGO_DBNAME || "website");
  const movies = await db
    .collection("imdb_movies")
    .find()
    .limit(limit)
    .toArray();
  res.status(200).json(movies);
  client.close();
});

app.get("/api/movies/(:movieId)", async (req, res) => {
  const client = await MongoClient.connect(baseURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = client.db(process.env.MONGO_DBNAME || "website");
  const { movieId } = req.params;
  const movie = await db.collection("imdb_movies").findOne({ id: movieId });
  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(404).json("Could not find the movie");
  }
  client.close();
});

app.post("/api/movies/add", async (req, res) => {
  const client = await MongoClient.connect(baseURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = client.db(process.env.MONGO_DBNAME || "website");
  try {
    const newMovie = req.body;
    const result = await db.collection("imdb_movies").insertOne(newMovie);
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
  const client = await MongoClient.connect(baseURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const validIds = process.env.PERMITTED_USER_ID.split(",");
  const isValidId = validIds.includes(req.body.userId);

  if (!isValidId) {
    res.status(403).json("Invalid user ID.");
  } else {
    const db = client.db(process.env.MONGO_DBNAME || "website");
    try {
      const result = await db.collection("imdb_movies").updateOne(
        {
          id: req.body.movieId,
        },
        {
          $set: {
            seen: 1,
          },
        }
      );
      if (result) {
        res.status(200).json(result);
      } else {
        res.status(404).json("Could not find the movie");
      }
    } catch (error) {
      res.status(500).json(`${error.message}`);
    }
  }
  client.close();
});

app.listen(process.env.PORT || 8000, () => {
  console.log("Server is listening");
});
