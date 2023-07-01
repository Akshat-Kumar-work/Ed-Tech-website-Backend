 const User = require("../models/user");
 const mailSender = require("../utils/mailSender");

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

    //fetch data

    //validation

    //get userdetails from db using token

    //if no entry for token -> invalid token or token time expired

 }