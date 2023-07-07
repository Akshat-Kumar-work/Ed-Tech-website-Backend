// Import the required modules
const express = require("express")
const router = express.Router()

//importing middlewares
const { auth,  isStudent } = require("../middleware/auth");

//importing controllers
