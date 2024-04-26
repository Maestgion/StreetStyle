import { User } from "../models/user.model.js";
import {Order} from "../models/order.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"


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

const getAllOrders = asyncHandler(async (req, res)=> {
    const { page = 1, limit = 10 } = req.query;
    const orderAggregate = EcomOrder.aggregate([
      {
      
        $match: {
          customer: req.user._id,
        },
      },
   
      {
        $lookup: {
          from: "users",
          localField: "customer",
          foreignField: "_id",
          as: "customer",
          pipeline: [
            {
              $project: {
                _id: 1,
                username: 1,
                email: 1,
              },
            },
          ],
        },
      },
     
      {
        $lookup: {
          from: "coupons",
          foreignField: "_id",
          localField: "coupon",
          as: "coupon",
          pipeline: [
            {
              $project: {
                name: 1,
                couponCode: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          customer: { $first: "$customer" },
          coupon: { $ifNull: [{ $first: "$coupon" }, null] },
          totalOrderItems: { $size: "$items" },
        },
      },
      {
        $project: {
          items: 0,
        },
      },
    ]);
  
    const orders = await EcomOrder.aggregatePaginate(
      orderAggregate,
      getMongoosePaginationOptions({
        page,
        limit,
        customLabels: {
          totalDocs: "totalOrders",
          docs: "orders",
        },
      })
    );
  
    return res
      .status(200)
      .json(new ApiResponse(200, orders, "Orders fetched successfully"));
  })

export {
    getProfile,
    updateAccount,
    getAllOrders
}