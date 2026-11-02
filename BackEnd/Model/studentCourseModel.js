import mongoose from "mongoose";
const studentCourseSchema=new mongoose.Schema({
       userId:{
          type:mongoose.Schema.Types.ObjectId,
          ref:"User",
          required:true,
          
    },
    courseId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
        required:true,
        
    },
    enrollmentDate:{
        type:Date,
        default:Date.now
    },
     programType:{
            type:String,
            enum:["Regular","Extension","weekend"],
            required:true
        },
    status:{
        type:String,
        enum:["active","dropped","completed"],
        default:"active"
    }
},{timestamps:true})
const StudentCourse=mongoose.model("studentCourse",studentCourseSchema)
export default StudentCourse


