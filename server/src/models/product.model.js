import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        category: {
          ref: "Category",
          required: true,
          type: Schema.Types.ObjectId,
        },
        description: {
          required: true,
          type: String,
        },
        mainImage: {
          required: true,
          type: {
            url: String,
            localPath: String,
          },
        },
        name: {
          required: true,
          type: String,
        },
        owner: {
          ref: "User",
          type: Schema.Types.ObjectId,
        },
        price: {
          default: 0,
          type: Number,
        },
        stock: {
          default: 0,
          type: Number,
        },
        subImages: {
          type: [
            {
              url: String,
              localPath: String,
            },
          ],
          default: [],
        },
      },
      { timestamps: true }
    );
   


export const Product = mongoose.model("products", productSchema)