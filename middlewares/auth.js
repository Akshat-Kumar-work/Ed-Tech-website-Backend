const jwt = require("jsonwebtoken");
require("dotenv").config(); 


//authentication handler
exports.auth = async(req , res , next)=>{
    try{
        //fetching token
        const token = req.cookies.token || req.header("Authorization").replace("Bearer ","");

        //if token is missing
        if(!token){
            return res.status(401).json({
                success:false,
                message:"Token is missing"
            });
        }

        try{
            //verify token
            const decode = jwt.verify(token,process.env.JWT_secret);
            
            req.user = decode;
        }
        catch(err){
            console.log("token is invalid",err)
            return res.status(401).json({
                success:false,
                message:"token is invalid"
            })
        }

        next();
       

    }
    catch(err){
        console.log("authentication error:",err)
        return res.status(401).json({
            success:false,
            message:"something went wrong authentication error"
        })
    }
}

//student -> authorization 
exports.isStudent = async (req,res, next) =>{
    try{
        if(req.user.accountType !== "Student"){
            return res.status(401).json({
                success:false,
                message:"role is not defined"
            })
        }
        next();
    }
    catch(err){
        console.log("student authorization faild",err);
        return res.status().json({
            success:false,
            message:"you are not student"
        })
    }
}

//instructor -> authorization
exports.isInstructor = async(req,res,next)=>{
    try{
        if(req.user.accountType !== "Instructor"){
            return res.status(401).json({
                success:false,
                message:"role is not defined"
            })
        }
        next();
    }
    catch(err){
        console.log("Instructor authorization faild",err);
        return res.status().json({
            success:false,
            message:"you are not Instructor"
        })
    }
}


//admin -> authorization
exports.isAdmin = async(req,res,next)=>{
    try{
        if(req.user.accountType !== "Admin"){
            return res.status(401).json({
                success:false,
                message:"role is not defined"
            })
        }
        next();
    }
    catch(err){
        console.log("Admin authorization faild",err);
        return res.status().json({
            success:false,
            message:"you are not Admin"
        })
    }
}