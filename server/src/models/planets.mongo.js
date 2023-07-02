const mongoose = require("mongoose");

// This schema defines the data model for the planets collection in the database.
const planetsSchema = new mongoose.Schema({
	keplerName: {
		type: String,
		required: true,
	},
});

module.exports = mongoose.model("Planet", planetsSchema);
