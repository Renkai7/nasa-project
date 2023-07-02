const mongoose = require("mongoose");

// This schema defines the data model for the launches collection in the database.
const launchesSchema = new mongoose.Schema({
	flightNumber: {
		type: Number,
		required: true,
	},
	launchDate: {
		type: Date,
		required: true,
	},
	mission: {
		type: String,
		required: true,
	},
	rocket: {
		type: String,
		required: true,
	},
	target: {
		type: String,
	},
	customers: [String],
	upcoming: {
		type: Boolean,
		required: true,
	},
	success: {
		type: Boolean,
		required: true,
		default: true,
	},
});

// Connect the launches schema to the launches collection in the database.
module.exports = mongoose.model("Launch", launchesSchema);
