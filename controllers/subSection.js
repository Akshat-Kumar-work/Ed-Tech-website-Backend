const SubSection = require("../models/subSection");
const Section = require("../models/section");

//create subsection handler
exports.createSubSection = async(req ,res)=>{
    try{
        //fetching data from req
        const{ sectionId ,  title , timeDurationduration , description   } = req.body;
        // fetching video file 
        const video = req.files.file
        //validation
        if(!sectionId || !title || !timeDuration || !description ||!video){
            
        }

   }
        catch(err){

        }
}