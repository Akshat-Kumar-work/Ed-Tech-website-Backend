const SubSection = require("../models/subSection");
const Section = require("../models/section");
const {ImageUploaderToCloudinary} =require("../utils/imageUploader")
require("dotenv").config();


//create subsection handler
exports.createSubSection = async(req ,res)=>{
    try{
        //fetching data from req
        const{ sectionId ,  title , timeDuration , description   } = req.body;
        // fetching video file 
        const video = req.files.file
        //validation
        if(!sectionId || !title || !timeDuration || !description ||!video){
            return res.status(400).json({
                success:false,
                message:"all fields are not filled"
            })
        }
        //upload video to cloudinary
        const uploadDetails = await ImageUploaderToCloudinary(video , process.env.FOLDER_NAME);
        //create a subsection entry in db
        const SubSectionDetails = await SubSection.create({
            title:title,
            timeDuration:timeDuration,
            description:description,
            videoUrl:uploadDetails.secure_url
        })
        //update the section also
        const updatedSection = await Section.findByIdAndUpdate( {_id:sectionId} ,
                                                         {$push:{subSection:SubSectionDetails._id}} ,
                                                         {new:true}).populate("subSection");

        //return response
        return res.status(200).json({
            success:true,
            message:"sub section created successfully",
            updatedSection
        })
   }
        catch(err){
            console.log(err)
            return res.status(500).json({
                success:false,
                message:"internal err , while updating subsection"
            })
        }
}

//update subsection handler
exports.updateSubSection = async (req, res) => {
    try {
      const { subsectionId, title, description } = req.body
      const subSection = await SubSection.findById(subsectionId)
  
      if (!subSection) {
        return res.status(404).json({
          success: false,
          message: "SubSection not found",
        })
      }
  
      if (title !== undefined) {
        subSection.title = title
      }
  
      if (description !== undefined) {
        subSection.description = description
      }
      if (req.files && req.files.video !== undefined) {
        const video = req.files.video
        const uploadDetails = await uploadImageToCloudinary(
          video,
          process.env.FOLDER_NAME
        )
        subSection.videoUrl = uploadDetails.secure_url
        subSection.timeDuration = `${uploadDetails.duration}`
      }
  
      await subSection.save()
  
      return res.json({
        success: true,
        message: "Section updated successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the section",
      })
    }
  }


//delete sub section handler
exports.deletesubSection = async(req,res) =>{
    try{

        //we are assuming that we are sending id in parameters
        const{subsectionId} = req.params;

       if (!subsectionId){
        return res.status(400).json({
            success:"false",
            message:"missing properties"
        })
       }

       const newsubSection = await Section.findByIdAndDelete( subsectionId ,{new:true});

       //to delte in section also

       return res.status(200).json({
        success:true,
        message:"deleted successfully"
       })
    }
    catch(err){
        console.log(err)
        return res.status(500).json({
            success:false,
            message:"unable to delete subsection",
            error:err
        })
    }
}
