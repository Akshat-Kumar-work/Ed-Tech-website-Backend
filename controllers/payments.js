const {instance} = require("../config/Razorpay");
const Course = require("../models/course");
const User = require("../models/user");
const mailSender = require("../utils/mailSender");
const {courseEnrollementEmail} = require("../mail/templates/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");

//capture the payment and initiate the razor pay order -> course ka order create kro
exports.capturePayment = async(req ,res)=>{
    //get course id and user id
        const {course_id} = req.body;
        const userId = req.user.id;
    //validations
    //valid course id or not
        if(!course_id){
            return res.json({
                success:false,
                message:"please provide valid course id"
            })
        }
    //valid course detail or not
        let course;
        try{
            course = await Course.findById(course_id);
            if(!course){
                return res.json({
                    success:false,
                    message:"could not find the course wrong course id"
                })
            }

    //does user already paid for this course
            //converting userid which is string into object id , to check in teh student enrolled in course
            const uID = new mongoose.Types.ObjectId(userId)
            if(course.studentsEnrolled.includes(uID)){
                return res.status(200).json({
                    success:false,
                    message:"student is already enrolled"
                })
            }
        }
        catch(err){
            console.log(err);
            return res.status(500).json({
                success:false,
                message:err.message
            })
        }

    //create order now for courses
    const  amount = course.price;
    const currency = "INR";
    const options = {
        amount: amount*100,
        currency,
        receipt: Math.random(Date.now()).toString(),
        notes:{
            courseId : course_id,
            userId,
        }
    }
    try{
        //initiate the payment using razorpay -> creating order for course
        const paymentResponse = await instance.orders.create(options);
            console.log(paymentResponse);

            return res.status(200).json({
                success:true,
                courseName:course.courseName,
                courseDescription:course.courseDescription,
                thumbnail:course.thumbnail,
                orderId: paymentResponse.id,
                currency:paymentResponse.currency,
                amount:paymentResponse.amount
            })
    }
    catch(err){
        console.log(err);
        return res.json({
            success:false,
            message:"could not initiate order"
        })
    }

  
};




//after order creation -> ,when payment is done by user,the user bank transfer money to razorpay website wallet
// razorpay -> activate karega webhook ko ,aur fir webhook ki request aygi signature verification k lie jo neeche hogi






//this is done after payment is done by user and razor pay will send a request in which  web-hook is present with secret and we will match it with secret present in our server
//payment verification of razorpay and server, or payment authorization
exports.verifySignature = async(req ,res)=>{
    const webhooksecret = "12345678";

    //razorpay will pass signature value in header , in this x-razorpay-signature key
    //razorpay already signature ko encrypt karke dega using Hmac-sha256 algo 
    const signature = req.headers["x-razorpay-signature"];

    //eslie hum bhi apne webhooksecret ko same algo se hash krdengy jis se hum use match kar pae
    //hashing the webhooksecret using Hmac algo or function present in crypto library 
    //here we have to pass the algo -> sha256 by which we have to hash it,and the value to be hashed
   const shasum = crypto.createHmac( "sha256" , webhooksecret);
   //converting shasum into string format
   shasum.update(JSON.stringify(req.body));
   //jab bhi koi hashing algo run krty hai kisi text par , toh jo output ata hai usko khty hai digest which is generally in hexa decimal format
   //creating digest
   const digest = shasum.digest("hex");

   //checking for signature and digest verification by comparing
   if(signature === digest){
    console.log("payment is authorized")

//jab razorpay request karega signature verification k lie , tab request body m order ki info bhi send karega, jisme notes present hai order vale,
//notes k andar humne course id or user id dali thi further action krwane k lie after signature verification
//fetch coursId and userId from request body
const {courseId , userId} = req.body.payload.payment.entity.notes;

    try{
    //find course and enroll the student into it
    const enrolledCourse = await Course.findOneAndUpdate( {_id:courseId},
                                                                {$push:{studentsEnrolled:userId}},
                                                                {new:true}
                                                        );
    if(!enrolledCourse){
        return res.status(500).json({
            success:false,
            message:"course not found"
        })
    }
    console.log(enrolledCourse)

    //find student and update course into list of enrolled courses
    const enrolledStudent = await User.findOneAndUpdate(
                                                        {_id:userId},
                                                        {$push:{courses:courseId}},
                                                         {new:true}
                                                         );

    //send mail to user for course enrollement successfully with designed template
    const emailResponse = await mailSender(enrolledStudent.email , 
                                            "Congratulation ,your course purchase is done successfully ",
                                            "body" );
    
    console.log(emailResponse);
   return res.status(200).json({
    success:true,
    message: "signature verified and course added"
   });
}
catch(err){
    console.log(err);
    return res.status(500).json({
        success:false,
        message:err.message
    })
}
   }
   else{
    return res.status(400).json({
        success:false,
        message:"invalid request"
    })
   }
};









