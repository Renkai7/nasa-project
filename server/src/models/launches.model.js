const axios = require("axios"); // This is the HTTP client.

const launchesDatabase = require("./launches.mongo"); // This is the database connection.
const planets = require("./planets.mongo"); // This is the database connection.

const DEFAULT_FLIGHT_NUMBER = 100; // This is the default flight number.

const launch = {
	flightNumber: 100, // This is the flight_number.
	mission: "Kepler Exploration X", // This is the name.
	rocket: "Explorer IS1", // This is the rocket.name.
	launchDate: new Date("December 27, 2030"), // This is the date_local.
	target: "Kepler-442 b", // not applicable.
	customers: ["ZTM", "NASA"], // This is the payloads.customers.
	upcoming: true, // This is the upcoming.
	success: true, // This is the success.
};

saveLaunch(launch); // Save the launch to the database.

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function populateLaunches() {
	console.log("Downloading launch data...");
	const response = await axios.post(SPACEX_API_URL, {
		query: {},
		options: {
			pagination: false, // This disables pagination.
			populate: [
				{
					path: "rocket",
					select: {
						name: 1,
					},
				},
				{
					path: "payloads",
					select: {
						customers: 1,
					},
				},
			],
		},
	});

	if (response.status !== 200) {
		console.log("Problem downloading launch data");
		throw new Error("Launch data download failed.");
	}

	const launchDocs = response.data.docs;
	for (const launchDoc of launchDocs) {
		const payloads = launchDoc["payloads"];
		// turn the payloads into an array of customers.
		const customers = payloads.flatMap((payload) => {
			return payload["customers"];
		});

		const launch = {
			flightNumber: launchDoc.flight_number,
			mission: launchDoc.name,
			rocket: launchDoc.rocket.name,
			launchDate: launchDoc.date_local,
			upcoming: launchDoc.upcoming,
			success: launchDoc.success,
			customers,
		};

		console.log(`${launch.flightNumber} ${launch.mission}`);

		await saveLaunch(launch);
	}
}

async function loadLaunchData() {
	const firstLaunch = await findLaunch({
		flightNumber: 1,
		rocket: "Falcon 1",
		mission: "FalconSat",
	});

	if (firstLaunch) {
		console.log("Launch data already loaded!");
	} else {
		await populateLaunches();
	}
}

// This function returns a single launch from the database.
async function findLaunch(filter) {
	return await launchesDatabase.findOne(filter);
}

// Check if launch exists
async function existsLaunchWithId(launchId) {
	return await findLaunch({
		flightNumber: launchId,
	});
}

// This function returns the latest flight number.
async function getLatestFlightNumber() {
	const latestLaunch = await launchesDatabase.findOne().sort("-flightNumber");
	// If there are no launches, return the default flight number.
	if (!latestLaunch) {
		return DEFAULT_FLIGHT_NUMBER;
	}
	return latestLaunch.flightNumber;
}

// This function returns all launches from the database.
async function getAllLaunches(skip, limit) {
	return await launchesDatabase
		.find({}, { _id: 0, __v: 0 })
		.sort({ flightNumber: 1 })
		.skip(skip)
		.limit(limit);
}

async function saveLaunch(launch) {
	// Save the launch to the database.
	await launchesDatabase.findOneAndUpdate(
		{
			flightNumber: launch.flightNumber,
		},
		launch,
		{
			upsert: true,
		}
	);
}

async function scheduleNewLaunch(launch) {
	const planet = await planets.findOne({
		keplerName: launch.target,
	});
	// Throw an error if no matching planet was found.
	if (!planet) {
		throw new Error("No matching planet was found.");
	}
	const newFlightNumber = (await getLatestFlightNumber()) + 1;

	const newLaunch = Object.assign(launch, {
		success: true,
		upcoming: true,
		customers: ["Zero to Mastery", "NASA"],
		flightNumber: newFlightNumber,
	});

	await saveLaunch(newLaunch);
}

async function abortLaunchById(launchId) {
	const aborted = await launchesDatabase.updateOne(
		{
			flightNumber: launchId,
		},
		{
			upcoming: false,
			success: false,
		}
	);

	return aborted.modifiedCount === 1;
}

module.exports = {
	loadLaunchData,
	existsLaunchWithId,
	getAllLaunches,
	scheduleNewLaunch,
	abortLaunchById,
};
