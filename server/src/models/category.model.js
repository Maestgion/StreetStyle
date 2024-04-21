import mongoose from "mongoose";

const categoryScema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    }
})

export const Category = mongoose.model("Category", categoryScema)