// const URL = "mongodb+srv://namastedev:backendpassforme@namastedev.zvw6f.mongodb.net/"


const mongoose = require("mongoose")

const mongoDb = async () => {
    await mongoose.connect("mongodb+srv://namastedev:backendpassforme@namastedev.zvw6f.mongodb.net/namastedev");
};

mongoDb()
    .then(() => {
        console.log("db connected");
    })
    .catch(() => {
        console.log("not connect");
    })