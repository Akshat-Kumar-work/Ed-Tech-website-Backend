const Tag = require("../models/tag");

//create tag handler function
exports.createTag = async(req, res)=>{
    try{
        //fetch data
        const { name , description} = req.body;
        //validation
        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:"all fields are required"
            })
        }
        //create entry in db
        const tagDetails = await Tag.create({
            name:name , 
            description:description
        });
        console.log(tagDetails);

        return res.status(200).json({
            success:true,
            message:"tag created successfully"
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:err.message
        })
    }
}

//get all tag handler
exports.showAllTags = async(req ,res) =>{
    try{
        //jo bhi data find krke laengy make sure ki usme name and description ho
        const allTags = await Tag.find({} , { name:true , description:true});
        
        res.status(200).json({
            success:true,
            message:"all tags returned successfully"
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:err.message
        })
    }
}