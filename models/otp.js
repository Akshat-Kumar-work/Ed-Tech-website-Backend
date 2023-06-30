const mongoose = require("mongoose");
const mailsender = require("../utils/mailSender")
const otpSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires:5*60
    }
})

//function to send mail
async function sendVerificationEmail(email , otp){
    try{
        const mailResponse = await mailsender(email , "Verification email", otp);
        console.log("email sent successfully",mailResponse)
    }
    catch(err){
        console.log("error occured while sending mail",err)
    }
}

//pre middleware
otpSchema.pre("save",async function (next){
    await sendVerificationEmail(this.email , this.otp);
    next();
})

module.exports = mongoose.model("OTP",otpSchema)