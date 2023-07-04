const Section = require("../models/section");
const Course = require("../models/course");


 exports.createSection = async(req ,res)=>{
    try{
        //fetch data
        const {sectionName , courseId} = req.body;
        //validation
        if(!sectionName || !courseId){  return res.status(400).json({
            success:"false",
            message:"missing properties"
        })}
      
        //create section
        const newSection = await Section.create({sectionName});
        //update in course schema also 
        const updatedCourse = await Course.findByIdAndUpdate(
                                            courseId, {
                                                $push:{courseContent:newSection._id}
                                            },
                                            {new:true}
                                            ).populate("courseContent")
        //return response
        return res.status(200).json({
            success:"true",
            message:"section created successfully",
            updatedCourse
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"unable to create section",
            error:err
        })
    }
}

//course update handler
exports.updateSection = async(req ,res)=>{
    try{
        const {sectionName , sectionId} = req.body;

        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:"false",
                message:"missing properties"
            })
        }

        //update section
        const section = await Section.findByIdAndUpdate(sectionId , 
                                                                    {sectionName:sectionName},
                                                                    {new:true}
                                                                     );

            return res.status(200).json({
                success:true,
                message:"section Updated Successfully"
            })
        }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"unable to create section",
            error:err
        })
    }
}


exports.deleteSection = async(req,res) =>{
    try{

        //we are assuming that we are sending id in parameters
        const{ sectionId} = req.params;

       if (!sectionId){
        return res.status(400).json({
            success:"false",
            message:"missing properties"
        })
       }

       const newSection = await Section.findByIdAndDelete( sectionId ,{new:true});

       return res.status(200).json({
        success:true,
        message:"deleted successfully"
       })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"unable to delete section",
            error:err
        })
    }
}