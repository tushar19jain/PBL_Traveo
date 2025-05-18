const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const graphRoutes = require("./routes/graph.routes");
app.use("/api",graphRoutes);

const recommendRoute = require('./routes/recommend.route');
app.use("/api", recommendRoute);

const playgroundRoutes = require("./routes/playground.route");
app.use("/api", playgroundRoutes);

app.listen(5000, () => {
    console.log("Server is running on port 5000");
});   