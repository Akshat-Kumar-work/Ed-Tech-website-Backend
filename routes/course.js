//import required modules
const express = require("express");
const router = express.Router()



//-----------------------------------------importing CONTROLLERS-------------------------------------
//course controllers
const { createCourse , getAllCourses , getCourseDetails} = require("../controllers/course")

//category controller
const { createCategory , showAllCategories , categoryPageDetails} = require("../controllers/category")

//section controller
const { createSection , updateSection , deleteSection} = require("../controllers/section")

//sub section controller
const { createSubSection , updateSubSection , deletesubSection } = require("../controllers/subSection")

//rating controller
const {createRating , getAverageRating , getAllRating} = require("../controllers/ratingAndReview")
//-----------------------------------------------------------------------------------------------------------------





//--------------------------------------importing MIDDLEWARES------------------------------------------
const { auth , isAdmin , isInstructor , isStudent} = require("../middlewares/auth")
//-----------------------------------------------------------------------------------------------------------------





//--------------------------------ROUTES------------------------------------------------------------------------


//-----------------------------------------------------------------------------------------------------------------
//COURSE ROUTES

//create new course
router.post("/createCourse",auth ,isInstructor ,createCourse);

//add section to course
router.post("/addSection",auth , isInstructor , createSection);

//update section
router.post("/updateSection",auth , isInstructor, updateSection);

//delete section
router.post("/deleteSection",auth ,isInstructor,deleteSection);

//create subsection
router.post("/addSubsection",auth , isInstructor , createSubSection);

//update subsection
router.post("/updateSubsection",auth , isInstructor , updateSubSection);

//delete subsection
router.post("/deleteSubsection",auth , isInstructor , deletesubSection);

//get all  course
router.get("/getAllCourses",getAllCourses);

//get details of specific course
router.get("/getCourseDetails",getCourseDetails);
//-----------------------------------------------------------------------------------------------------------------





//-----------------------------------------------------------------------------------------------------------------
//CATEGORY ROUTES

//create category
router.post("/createCategory",auth , isAdmin , createCategory);

//show all categories
router.get("/showAllCategories",showAllCategories)

//get category page details
router.get("/getCategoryPageDetails", categoryPageDetails)
//-----------------------------------------------------------------------------------------------------------------





//-----------------------------------------------------------------------------------------------------------------
//RATING AND REVIEW ROUTES

//create rating
router.post("/createRating", auth, isStudent, createRating)

//get average rating
router.get("/getAverageRating", getAverageRating)

//get reviews
router.get("/getReviews", getAllRating)
//-----------------------------------------------------------------------------------------------------------------



module.exports = router



