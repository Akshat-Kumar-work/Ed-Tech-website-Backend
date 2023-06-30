const user = require("..//models/user");
const OTP = require("../models/otp");
const otpGenerator = require("otp-generator");

//to send otp for sign up 
 exports.sendOTP = async(req,res)=>{
    try{

    //fetch email from request body
    const {email} = req.body;

    //check user exist or not
    const isUserPresent = await user.findOne({email});

    //if user exist
    if(isUserPresent){
        return res.status(401).json({
            success:false,
            message:"user already registered"
        })
    }

    //if user not exist
    //generate otp
    var otp = otpGenerator.generate(6,{
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false,
    })
    console.log("otp generated",otp);

    //check unique otp or not
    let result = await OTP.findOne({otp:otp});
    //if result true so otp is not unique 
    while(result){
        otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        })
        result = await OTP.findOne({otp:otp})
    }

    const otpPayload = {email , otp};

    //create entry in db
    const  otpbody = await OTP.create(otpPayload)
    console.log("otp body", otpbody);

    res.status(200).json({
        success:true,
        message:"otp sent successfully",
        otp
    })
    }
    catch(err){
        console.log("error while generating otp",err);
        return res.status(500).json({
            success:false,
            message:"unable to generate otp"
        })
    }
 }



//to sign up
exports.signUp = async (req ,res)=>{

    
}



//to login

//to change password