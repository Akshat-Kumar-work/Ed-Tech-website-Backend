 const User = require("../models/user");
 const mailSender = require("../utils/mailSender");
 const bcrypt = require("bcrypt");
 //reset password - token
 try{
    exports.resetPasswordToken = async (req ,res)=>{
     
        //get email from request body
        const email = req.body.email;
        //check user for this email
        const user = await User.findOne({email});
        if(!user){
            return res.json({
                success:false,
                message:"your email is not registered"
            })
        }
        //generating token by randomUUID which generate randome unique user identifiers
        //here token is not that jwt token it is any string value we are refering unique user id as token
        const token = crypto.randomUUID();
        //update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate({email} , {token:token , resetPasswordExpires : Date.now()+5*60*1000},{new:true} )
      
        //generate link for frontend , using 3000 because frontend is on port number 3000
        const url = `http://localhost:3000/update-password/${token}`
    
        //send mail containing url
        await mailSender(email , "Password reset link" , `click to reset password ${url}` )
    
        //return response
        return res.status(200).json({
            success:true,
            message:"email sent successfully to reset password"
        })
    
     }
 }
catch(err){
console.log("error while sending reset mail",err);
return res.status(500).json({
    success:false,
    message:"unable to send mail to reset password"
})
}
 //reset password
 exports.resetPassword = async (req , res )=>{

    try{
        //fetch data
    const {password , confirmPassword , token} = req.body;
    //validation
    if(password !== confirmPassword){
        return res.status().json({
            success:false,
            message:"password not matching"
        })
    }
    //get userdetails from db using token
    const userdetails = await User.findOne({token:token});
    
    //if no entry for token -> invalid token or token time expired
    if(!userdetails){
        return res.json({
            success:false,
            message:"token is invalid"
        })
    }
    //agar userpassword ka time aaj k time sy jyda hai toh mtlb token expire hogya hai
    if(userdetails.resetPasswordExpires < Date.now()){
        return res.json({
            success:false,
            message:"token is expired"
        })
    }

    //hashing password
    const hashedpassword =  bcrypt.hash(password , 10);

    //update password
    await User.findOneAndUpdate( {token} , {password:hashedpasswordpassword} , {new:true})

    //return response
    return res.status(200).json({
        success:true,
        message:"password reset successfully"
    })
    }
    catch(err){
        console.log("error while reseting password",err);
        return res.json({
            success:false,
            message:"unable to reset password"
        })
    }
 }