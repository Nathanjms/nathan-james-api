import express from "express";

const app = express();
app.use(express.json());

app.get("/morning", (req, res) => {
  res.send("Good Morning");
});

app.get("/afternoon", (req, res) => {
  res.send("Good Afternoon");
});

app.get("/hello/(:name)", (req, res) => {
  res.send(`Hello ${req.params.name}`);
});

app.post("/hello", (req, res) => {
  res.send(`Hello ${req.body.name}`);
});

app.listen(8000, () => {
  console.log("Server is listening on port 8000");
});
