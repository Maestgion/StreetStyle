import { Cart } from "../models/cart.models.js";
import {User} from "../models/user.models.js"
import {Coupon} from "../models/coupon.models.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const cartUtil = async(userId)=>{
    const aggregatedCart = await Cart.aggregate([
        {
            $match:{
                user: userId
            }
        }, 
        {
            $unwind: "$items"
        }, 
        {
            $lookup: {
                from: "products",
                localField: "items.productId",
                foreignField: "_id",
                as: "product"
            }
        }, 
        {
            $project: {
                product: {$first: "$product"},
                quantity: "$items.quantity",
                coupon: 1
            }
        },
        {
            $group: {
                _id: "$_id",
                items: {
                    $push: "$$ROOT"
                }, 
                cartTotal: {
                    $sum: {
                        $multiply: ["$product.price", "$quantity"]
                    }
                },
                coupon: {$first: "$coupon"}

            }
        }, 
        {
            $lookup: {
                from: "coupons",
                localField: "coupon",
                foreignField: "_id",
                as: "coupon"

            }
        }, 
        {
            $addFields: {
                coupon: {$first: "$coupon"}
            }
        },
        {
            $addFields: {
                discountedTotal: {
                    $ifNull: [
                        {
                            $subtract: ["$cartTotal", "$coupon.discountValue"]
                        },
                        "$cartTotal"
                    ]
                }
            }
        }
    ])

    return (
        aggregatedCart[0] ?? {
          _id: null,
          items: [],
          cartTotal: 0,
          discountedTotal: 0,
        }
      );
}

const getCartItems = asyncHandler(async (req, res)=>{
    
   const cart = await cartUtil(req.user._id)

   return res.status(200).json(
    new ApiResponse(
        200,
        cart,
        "user cart fetched successfully"
    )
   )

})


const addToCart = asyncHandler(async (req, res)=>{
    const {quantity, couponCode} = req.body;
    const {productId}  = req.params;
    const userId = req.user._id;

    const coupon = await Coupon.find({code: couponCode})

    
})


const removeFromCart = asyncHandler(async (req, res)=>{
        
})


const removeAllFromCart = asyncHandler(async (req, res)=>{

})



export {
    getCartItems,
    addToCart,
    removeFromCart,
    removeAllFromCart

} 
