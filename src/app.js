
const express = require("express")
require("./config/database")
const User = require("./models/user")

const app = express()

//middleware for req handle apply for all routes 
app.use(express.json());

app.post("/signup", async (req, res) => {
    const user = new User(
        // ** for Dynamic 
        req.body

        //**** static data */
        // {
        // firstName: "Bishwajeet",
        // lastName: "maurya",
        // emailId: "kumar@gmail.com",
        // password: "hi123",
        // age: 22,
        // gender: "male"
        // }

    )

    try {
        await user.save();
        res.send("user saved Successfully")
    }
    catch (err) {
        res.send("something wrong!!!")
    }


})

app.listen("7000", () => {
    console.log("running");
})
