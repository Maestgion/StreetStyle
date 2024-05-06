import { Cart } from "../models/cart.models.js";
import {User} from "../models/user.models.js"
import {Coupon} from "../models/coupon.models.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Product } from "../models/product.models.js";


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


const addOrUpdateCartItems = asyncHandler(async (req, res)=>{


    const {quantity} = req.body
    const {productId} = req.params

    const cart = await Cart.findOne({
        user: req.user._id
    })

    const product = await Product.findById(Product)

    if(!product)
    {
        throw new ApiError(404, "product not found")
    }

    if(quantity>product.stock)
    {
        throw new ApiError(400, 
            product.stock>0 ? "only " + product.stock + " products are remaining in the stock. And, you are adding " + quantity + " products." 
            : "product is out of stock"
        )
    }
    
    const existingProduct = cart.items?.find((item)=>item.productId.toString()=== productId)

    if(existingProduct)
    {
       existingProduct.quantity = quantity


       if(cart.coupon)
        {
            cart.coupon = null
        }

    }else{
        cart.items.push(
            {
                productId,
                quantity
            }
        )
    }


    await cart.save({validateBeforeSave: true})

    const updatedCart = await cartUtil(req.user._id)

    res.status(201).json(
        new ApiResponse(201, updatedCart, "produt added successfully in the cart")
    )
})


const removeFromCart = asyncHandler(async (req, res)=>{
    // check if product exists
    // update the cart
    // handle coupon 
    // return the cart 

    const {productId} = req.params


    const product = await Product.findById(Product)

    if(!product)
    {
        throw new ApiError(404, "product not found")
    }

    const updatedCart = await Cart.findOneAndUpdate({
        user: req.user._id
    }, {
        $pull: {
            items: {
                productId
            }
        }
    }, {new: true})

    let cart = await getCartItems(req.user._id) 

    if(cart.coupon && cart.cartTotal < cart.coupon.minCartValue)
    {
        updatedCart.coupon = null

        await updatedCart.save({validateBeforeSave: true})

        cart = await cartUtil(req.user._id)
    }

    return res.status(200).json(200, cart, "item removed successfully");
})


const removeAllFromCart = asyncHandler(async (req, res)=>{
     await Cart.findOneAndUpdate({
        user: req.user._id
    },{
        $set:{
            items: [],
            coupon: null
        }
    },
        { new: true }
    );

    const cart = await cartUtil(req.user._id);
  
    return res
      .status(200)
      .json(new ApiResponse(200, cart, "Cart has been cleared successfully"));
})



export {
    getCartItems,
    addOrUpdateCartItems,
    removeFromCart,
    removeAllFromCart

} 
