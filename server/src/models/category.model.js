import mongoose from "mongoose";

const categoryScema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    }, 
    coverImage: {
        type: {
            url: String,
            public_id: String
        },
        required: true
    }
})

export const Category = mongoose.model("Category", categoryScema)