const Course = require("../models/course");
const Tag = require("../models/tag");
const User = require("../models/user");
const {ImageUploaderToCloudinary} = require("../utils/imageUploader");
require("dotenv").config();

//create course handler
exports.createCourse = async (req ,res) =>{
    try{
        //fetch info
        const {courseName , courseDescription , whatYouWillLearn , price , tag} = req.body

        //get thumbnail
        const thumbnail = req.files.thumbnailImage;

        //validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail){
            return res.status(401).json({
                success:false,
            message:"all fields are required"})
            }

            //check for instructor
            const userId = req.user.id;
            const instructorDetails = await User.findById(userId);
            console.log("instructor details",instructorDetails)

            if(!instructorDetails){
                return res.status(404).json({
                    success:false,
                    message:"instructor not found"
                })
            }

            //check given tag is valid or not
            const tagDetails = await Tag.findById(tag);

            if(!tagDetails){
                return res.status(404).json({
                    success:false,
                    message:"tag not found"
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
                tag:tagDetails._id,
                thumbnail:thumbnailImage.secure_url
            })

            //update to user-> instructor - add new course to user schema of instructor
            await User.findByIdAndUpdate(
                {_id:instructorDetails._id},
                //push or insert kar rhe hai course k array k andar newcourse ki id ko aur usko update kr rhe hai 
                {$push:{course:newCourse._id}},
                {new:true}
            )

            //update the tag schema
            await Tag.findByIdAndUpdate(
                {_id:tagDetails._id},
                //push or insert kar rhe hai course k array k andar newcourse ki id ko aur usko update kr rhe hai 
                {$push:{course:newCourse._id}},
                {new:true}
            )

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
exports.showAllCourser = async (req,res)=>{
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