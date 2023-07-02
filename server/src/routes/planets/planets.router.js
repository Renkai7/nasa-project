const express = require("express");

// get the getAllPlanets function from the planets.controller.js file
const { httpGetAllPlanets } = require("./planets.controller");

const planetsRouter = express.Router();

planetsRouter.get("/", httpGetAllPlanets);

module.exports = planetsRouter;
