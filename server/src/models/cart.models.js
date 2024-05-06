import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
   user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
   },
   items: {
    type: [
        {
            productId: {    
                type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
            },
            qunatity:{
                type: Number,
                required: true,
                min: [1, "quantity can't be less than 1"],
                default: 1
            }
        }
       ],
    default: []
   }, 
   coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Coupon"
   }
})

export const Cart = mongoose.model("Cart", cartSchema)