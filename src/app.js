
const express = require("express")

const app = express()


app.use("/app", (req, res) => {
    res.send("app data")
})

app.listen("7000", () => {
    console.log("connected");
})
