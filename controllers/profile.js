const Profile = require("../models/profile");
const User = require("../models/user")

//update profile
exports.updateProfile = async (req ,res)=>{
    try{

        //get data
        const {dateOfBirth="", about="",contactNumber ,gender} = req.body
        //get user id from req which is present in payload while decoding the token from cookies
        const id = req.user.id;
        //validation
        if(!contactNumber || !gender || !id){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }
        //find profile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId)
            profileDetails.dateOfBirth = dateOfBirth;
            profileDetails.about = about;
            profileDetails.gender = gender;
            profileDetails.contactNumber = contactNumber;
        //update profile
        await profileDetails.save()
        //return response
        return res.status(200).json({
            success:true,
            message:"profile updated successfully"
        })
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"unable to update profile"
        })
    }
}


//delete profile
exports.deleteProfile = async (req , res)=>{
    try{
        //get id of user
        const id = req.user.id;
        //validation
        const userDetails = await User.findById(id);
        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:"user not found"
            })
        }
        //delete profile 
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails})
        //delete user
        await User.findByIdAndDelete({_id:id})
        //delete student from enrolled count also

        //return response
        return res.status(200).json({
            success:true,
            message:"account deleted successfully"
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"unable to delete profile"
        })
    }
}

//get all details of user
exports.getAllUserDetails = async(req,res)=>{
   try{
    const id = req.user.id
    const userDetails = await User.findById(id).populate("additionalDetails").exec();
    return res.status(200).json({
        success:true,
        message:"user data fetched successfully"
    })
   }
   catch(err){
    return res.status(500).json({
        message:err.message
    })
   }
}