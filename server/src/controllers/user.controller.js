import { User } from "../models/user.model.js";
import {Order} from "../models/order.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import { getMongoosePaginateOptions } from "../utils/helpers.js";


const getProfile = asyncHandler(async (req, res)=>{
    const userId = req.user?._id;

    if(!userId)
    {
        throw new ApiError(401, "Unauthorized request");
    }

    const profile = await User.findById(userId).select("-password -forgotPasswordToken -forgetPasswordExpiry -emailVerificationToken -emailVerificataionExpiry");

    return res.status(200).json(new ApiResponse(200, profile, "user profile retrieved successfully!"))
})

const updateAccount = asyncHandler(async (req, res)=>{
    const userId = req.user?._id

    if(!userId)
    {
        throw new ApiError(401, "Unauthorized request");
    }

    const profile = await User.findByIdAndUpdate(userId, {
        $set:{
            firstName,
            lastName
        } 
    },{
        new: true
    })

    return res.status(200).json(new ApiResponse(200, profile, "user profile updated successfully!"))

})

const getAllOrders = asyncHandler(async (req, res)=>{
    const {page, limit} = req.query

    const aggregatedOrders = await Order.aggregate([
        {
            $match: {
                user: req.user?._id
            }
        }, 
        {
            $lookup:{
                from: "users",
                localField: "user",
                foreignField: "._id",
                as: "customerInfo",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            firstName: 1,
                            lastName: 1,
                            email: 1
                        }
                    }
                ]
            }
        }, 
        {
            $lookup: {
                from: "coupons",
                localField: "couponCode",
                foreignField: "_id",
                as: "couponInfo",
                pipeline: [
                    {
                        $project: {
                            name: 1,
                            code: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                customer: {$first: "$customerInfo"},
                totalOrders: {$size: items},
                coupon: {ifNull: [{$first: "$couponInfo"}, null] }
            }
        }
    ])


    const orders = await Order.aggregatePaginate(
        aggregatedOrders,
        getMongoosePaginateOptions(
          {
            page, 
            limit,
            customLabels: {
                totalDocs: "totalOrders",
                docs: "orders"
            }
          }
        )
    )

    return res.status(200).json(new ApiResponse(
        200,
        orders,
        "all user orders retrieved successfully!"
    ))
})

export {
    getProfile,
    updateAccount,
    getAllOrders
}