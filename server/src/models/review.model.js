import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        }, 
        email: {
            type: String,
            required: true,
            trim: true
        },
        rating:{
            type: Number,
            default: 0,
            min: [1, "rating can't be less than 1"],
            max: [5, "this is the max rating"],
            required: true
        }, 
        reviewTitle: {
            type: String,
            required: true,
           
        },
        review:{
            type: String,
            requrired: true
        }

    }, 
    {timestamps: true}
)


export const Review = mongoose.model("Review", reviewSchema)