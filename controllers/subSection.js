const SubSection = require("../models/subSection");
const Section = require("../models/section");

//create subsection handler
exports.createSubSection = async(req ,res)=>{
    try{

        const{ sectionId ,  title , timeDurationduration , description   } = req.body;

        const video = req.files.file

        if(!sectionId || !title || !timeDuration || !description ||!video){
            
        }

   }
        catch(err){

        }
}