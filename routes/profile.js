// Import the required modules
const express = require("express")
const router = express.Router()

//importing middlewares
const { auth  } = require("../middlewares/auth");

//importing controllers
const { updateProfile , deleteAccount , getAllUserDetails , updateDisplayPicture , getEnrolledCourses } = require("../controllers/profile");

//profile routes
router.delete("/deleteProfile",auth, deleteAccount)
router.put("/updateProfile", auth, updateProfile)
router.get("/getUserDetails", auth, getAllUserDetails)
router.get("/getEnrolledCourses", auth, getEnrolledCourses)
router.put("/updateDisplayPicture", auth, updateDisplayPicture)


module.exports = router;