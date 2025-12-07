const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/mysocial");

const User = mongoose.model("User", { username: String });

app.post("/login", async (req, res) => {
    const { username } = req.body;

    let exists = await User.findOne({ username });

    if (exists) {
        return res.json({ status: "duplicate" });
    }

    await User.create({ username });

    res.json({ status: "ok" });
});

app.listen(3000, () => console.log("Server running"));
