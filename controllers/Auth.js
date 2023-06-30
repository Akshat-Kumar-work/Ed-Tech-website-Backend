const user = require("..//models/user");
const OTP = require("../models/otp");
const otpGenerator = require("otp-generator");
const Profile = require("../models/profile");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

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
    try{

        //fetch data from request body
        const { firstName , lastName , email , password , confirmPassword , accountType
        , contactNumber , otp} = req.body;
        //validation
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(403).json({
                success:false,
                message:"all field are required"
            })
        }
        //password and confirm password ko match krdo
        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:"password and confirm password value does not match , please try again"
            });
        }
        
        //check user already exist or not
        const exist = await user.findOne({email});

        if(exist){
            return res.status(400).json({
                success:false,
                message:"user already registered with the email",
            })
        }
        //find most recent otp for the user
        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log(recentOtp);

        //validate otp
        if(recentOtp.length == 0 ){
            //otp not found
            return res.status(400).json({
                success:false,
                message:"otp not found",
            })
        }
        else if(otp !== recentOtp.otp){
            //invalid otp
            return res.status(400).json({
                success:false,
                message:"invalid otp"
            })
        }
        //hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        //create entry in db 
        const profileDetails = await Profile.create({gender:null , dateOfBirth :null , about:null , contactNumber:null})
        const newUser = await user.create({
            firstName , lastName , email , contactNumber , password:hashedPassword , accountType , 
            additionalDetails:profileDetails._id , image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName}${lastName}`
        }) 

    return res.status(200).json({
            success:true,
            message:"sign up successfully"
        })

    }
    catch(err){
        console.log("error while signing up",err)
       return  res.status(500).json({
            success:false,
            message:"sorry unable to sign up now"
        })
    }
        
}


//to login

try{
//fetch email and password
const {email , password } = req.body;
if(!email || !password){
    return res.status(403).json({
        success:false,
        message:"please fill the data "
    })
}

//check User exist or not
const User = await user.findOne({email});

if(!User){
    return res.status(401).json({
        success:false,
        message:"user not registered ,sign up first",
    })
}

//if user exist 
//matching hash password
const passwordVerfication = await bcrypt.compare( password , user.password);
const payload = {
    email : User.email,
    id: User.id,
    role:User.role
}
if(passwordVerfication){
 const token = jwt.sign(payload , process.env.JWT_SECRET,{
        expiresIn:"2h" });

        User.token = token;
        User.password = undefined;

//generate cookie
res.cookie("token",token ,
 { expiresIn:new Date.now()+3*24*60*60*1000 , httpOnly:true}).status(200).json({
    success:true,
    token,
    User,
    message:"logged in successfully"
})
}
else{
    return res.status(401).json({
        success:false,
        message:"password is incorrect"
    })
}

}
catch(err){
     console.log("error while login ",err)
     return res.status(500).json({
        success:false,
        message:"unable to login "
     })
}


//to change password