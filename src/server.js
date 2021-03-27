import express from "express";
import Movies from "../movies";

const app = express();
app.use(express.json());

const movies = Movies.movies;

app.get("/api/movies", (req, res) => {
  res.status(200).json(movies);
});

app.get("/api/movies/(:movieId)", (req, res) => {
  const { movieId } = req.params;
  const movie = movies.find((movie) => movie.id == movieId);
  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(404).json("Could not find the movie");
  }
});

app.listen(8000, () => {
  console.log("Server is listening on port 8000...");
});
