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

const getAllOrders = asyncHandler()

export {
    getProfile,
    updateAccount,
    getAllOrders
}