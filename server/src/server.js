const http = require("http");

require("dotenv").config();

const app = require("./app");

const { mongoConnect } = require("./services/mongo");

const { loadPlanetsData } = require("./models/planets.model");
const { loadLaunchData } = require("./models/launches.model");

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

// This function starts the server by loading the planets data and listening on a specified port.
async function startServer() {
	// Connect to the MongoDB database.
	await mongoConnect();
	await loadPlanetsData(); // Wait for the planets data to be loaded before proceeding.
	await loadLaunchData();

	server.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);
	});
}

startServer();
