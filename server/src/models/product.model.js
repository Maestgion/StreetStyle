import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {

        name: {
            type: String,
            required: true,
            trim: true
        },
        features: {
            type: Map,
            of: String,
            required: true
        },
        miscellaneourFeatures: {
            type: [String]
        },
        description: {
            type: String,
            required: true
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },
        coverImage: {
            type: String,
            required: true

        },
        featuredImages: {
            type: [String]
        },
        price: {
            type: Number,
            required: true,
            default: 0
        },
        stock: {
            type: Number,
            required: true,
            default: 0
        },
        shippingDetails: {
            type: String,
            required: true
        }, 
        returnDetials: {
            type: String,
            required: true
        },
        careGuide: {
            type: String
        }

    }, {timestamps: true}
      
    );
   


export const Product = mongoose.model("Product", productSchema)