import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
    {
        firstName:{
            type: String,
            required: true
        },
       lastName:{
            type: String,
            required: true
        },
        addressLine1: {
            type: String,
            required: true,
        },
        addressLine2: {
            type: String
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        country: {
            type: String, 
            required: true
        },
        pincode: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        }

    }
    ,{
        timestamps: true
    }
)


export const Address = mongoose.model("Address", addressSchema)