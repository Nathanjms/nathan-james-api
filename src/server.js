import express from "express";

const app = express();

app.get("/morning", (req, res) => {
  res.send("Good Morning");
});
app.get("/afternoon", (req, res) => {
  res.send("Good Afternoon");
});

app.listen(8000, () => {
  console.log("Server is listening on port 8000");
});
