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

app.get("/", async (req, res) => {
  const client = await MongoClient.connect(baseURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  res
    .status(200)
    .json({ greeting: "Welcome to my API!", author: "Nathan James" });
  client.close();
});

app.get("/api/(:collection)/movies", async (req, res) => {
  var limit = 0;
  var collection = req.params.collection;
  if (collection === "movies-list") {
    collection = "movie_list";
  } else if (collection === "imdb") {
    collection = "imdb_movies";
  } else {
    res.status(404).json(`Collection ${collection} not found.`);
    return;
  }
  if (req.query.limit && req.query.limit > 0) {
    var limit = parseInt(req.query.limit);
  }
  var query = {};
  if (req.query.watched == "true") {
    query = { $or: [{ seen: true }, { seen: 1 }] }; // 1 for legacy.
  } else {
    query = { seen: false };
  }
  const client = await MongoClient.connect(baseURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = client.db(process.env.MONGO_DBNAME || "website");
  const movies = await db
    .collection(collection)
    .find(query)
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

app.post("/api/movies/add-movie", async (req, res) => {
  const client = await MongoClient.connect(baseURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = client.db(process.env.MONGO_DBNAME || "website");
  try {
    const newMovie = req.body;
    const result = await db.collection("movie_list").insertOne(newMovie);
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json("Could not create the movie");
    }
  } catch (error) {
    res.status(404).json(`${error.message}`);
  }
  client.close();
  return;
});

app.post("/api/movies/mark-seen", async (req, res) => {
  const client = await MongoClient.connect(baseURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  var collection = req.body.collection;
  if (collection !== "movie_list" && collection !== "imdb_movies") {
    res.status(404).json(`Collection ${collection} not found.`);
  } else {
    const validIds = process.env.PERMITTED_USER_ID.split(",");
    const isValidId = validIds.includes(req.body.userId);

    if (!isValidId) {
      res.status(403).json("Invalid user ID.");
    } else {
      const db = client.db(process.env.MONGO_DBNAME || "website");
      try {
        const result = await db.collection(collection).updateOne(
          {
            title: req.body.movieTitle,
          },
          {
            $set: {
              seen: true,
            },
          }
        );
        if (result && result.matchedCount == 0) {
          res.status(500).json("Could not find the Movie");
        } else if (result) {
          res.status(200).json(result);
        } else {
          res.status(404).json("Could not find the movie");
        }
      } catch (error) {
        res.status(500).json(`${error.message}`);
      }
    }
  }

  client.close();
});

app.listen(process.env.PORT || 8000, () => {
  console.log("Server is listening...");
});
