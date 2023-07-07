const Course = require("../models/course");
const Tag = require("../models/tag");
const User = require("../models/user");
const {ImageUploaderToCloudinary} = require("../utils/imageUploader");
const Category = require("../models/category")
require("dotenv").config();

//create course handler
exports.createCourse = async (req ,res) =>{
    try{
        //fetch info
        const {courseName , courseDescription , whatYouWillLearn , price , tag , category , status ,instructions} = req.body

        //get thumbnail
        const thumbnail = req.files.thumbnailImage;

        //validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail || !category){
            return res.status(401).json({
                success:false,
            message:"all fields are required"})
            }

           	// Check if the user is an instructor
            const userId = req.user.id;
            const instructorDetails = await User.findById(userId);
            console.log("instructor details",instructorDetails)

            if(!instructorDetails){
                return res.status(404).json({
                    success:false,
                    message:"instructor not found"
                })
            }


            //what is this mean
            if (!status || status === undefined) {
                status = "Draft";
            }


            //check given category is valid or not
            const categoryDetails = await Category.findById(category);

            if(!categoryDetails){
                return res.status(404).json({
                    success:false,
                    message:"Category not found"
                })
            }

            //upload img to cloudinary
            const thumbnailImage = await ImageUploaderToCloudinary(thumbnail , process.env.FOLDER_NAME)

            //create entry for new course
            const newCourse = await Course.create({
                courseName,
                courseDescription,
                instructor:instructorDetails._id,
                whatYouWillLearn,
                price,
                tag:tag,
                thumbnail:thumbnailImage.secure_url,
                status:status,
                instructions:instructions
            })

           		// Add the new course to the User Schema of the Instructor
            await User.findByIdAndUpdate(
                {_id:instructorDetails._id},
                //push or insert kar rhe hai course k array k andar newcourse ki id ko aur usko update kr rhe hai 
                {$push:{course:newCourse._id}},
                {new:true}
            )

            		// Add the new course to the Categories
                    await Category.findByIdAndUpdate(
                        { _id: category },
                        {
                            $push: {
                                course: newCourse._id,
                            },
                        },
                        { new: true }
                    );

            return res.status(200).json({
                success:true,
                message:"course created successfully",
                data:newCourse
            })
        }
    
    catch(err){
        return res.status(500).json({
            success:false,
            message:err.message
        })
    }
}
//get all courses handler
exports.getAllCourses = async (req,res)=>{
    try{
        const allCourses = await Course.find({} , {
            courseName :true , price:true , thumbnail:true , instructor:true , ratingAndReviews:true , studentsEnrolled:true
        }).populate("instructor").exec();

        return res.status(200).json({
            success:true,
            message:"data for all courses fetched successfully",
            data:allCourses
        })
    }
    catch(err){
        console.log(err)
        return res.status(500).json({
            success:false,
            message:"unable to fetch course data",
            
        })
    }
}