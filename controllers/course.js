const Course = require("../models/course");
const User = require("../models/user");
const {ImageUploaderToCloudinary} = require("../utils/imageUploader");
const Category = require("../models/category")
require("dotenv").config();

//create course handler
exports.createCourse = async (req ,res) =>{
    try{
        //fetch info
        let {courseName , courseDescription , whatYouWillLearn , price , tag , category , status ,instructions} = req.body

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
            const instructorDetails = await User.findById(userId , {accountType:"Instructor"});
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
                whatYouWillLearn:whatYouWillLearn,
                price,
                tag:tag,
                thumbnail:thumbnailImage.secure_url,
                status:status,
                instructions:instructions,
                category: categoryDetails._id
            })

           		// Add the new course to the User Schema of the Instructor
            await User.findByIdAndUpdate(
                {_id:instructorDetails._id},
                //push or insert kar rhe hai course k array k andar newcourse ki id ko aur usko update kr rhe hai 
                {$push:{courses:newCourse._id}},
                {new:true}
            )

            		// Add the new course to the Categories
                    await Category.findByIdAndUpdate(
                        { _id: category },
                        {
                            $push: {
                                courses: newCourse._id,
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
        console.log("error while creating course",err)
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


//get all details of course 
exports.getCourseDetails = async(req ,res)=>{

try{
    const {courseId} = req.body;
    console.log("course id ",courseId)

    if(!courseId){
        return res.status(400).json({
            success:false,
            message:"course id not found"
        })
    }

    const courseDetails =await Course.findById({_id: courseId })
                                                //populate karo instructor ko aur uske andar jo additional details usko bhi 
                                                .populate({ path:"instructor",populate:{path:"additionalDetails"} })
                                                //category bhi populate krdo
                                                .populate( "category")
                                                //rating and reviews ko bhi populate kro
                                                .populate("ratingAndReviews")
                                                //course content ko populate kro aur uske andar jo subsection hai usko bhi populate kro
                                                .populate( { path:"courseContent",populate:{path:"subSection"}})
                                                .exec()

    if(!courseDetails){
        return res.status(400).json({
            success:false,
            message:`couldn't find the course with this ${courseId} id `
        })
    }

    return res.status(200).json({
        success:true,
        message:"course details fetched succesfully",
        courseDetails
    })
}
catch(err){
    console.log(err)
    return res.status(500).json({
        success:false,
        message:"unable to fetch course details",
        
    })
}
}