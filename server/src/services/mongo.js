const mongoose = require("mongoose");
require("dotenv").config();
const MONGO_URL = process.env.MONGO_URL;

// This function is called when the MongoDB connection is opened.
mongoose.connection.once("open", () => {
	console.log("MongoDB connected!");
});

// This function is called if the MongoDB connection fails.
mongoose.connection.on("error", (err) => {
	console.error(err);
});

async function mongoConnect() {
	await mongoose.connect(MONGO_URL);
}

async function mongoDisconnect() {
	await mongoose.disconnect();
}

module.exports = {
	mongoConnect,
	mongoDisconnect,
};
