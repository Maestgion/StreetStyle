import {User} from "../models/user.model.js"
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import { asyncHandler } from "../utils/asyncHandler.js"
import { UserRolesEnum } from "../constants.js"


const registerUser = asyncHandler(async (req, res, next)=>{

    const {firstName, lastName, email, password, role} = req.body

    if([firstName, lastName, email, password].some(
        (field)=>field?.trim()==="")
    ){
        throw new ApiError(400, "Please fill all the details!")
    }

    const userExists = await User.findOne({email})

    if(userExists)
    {
        throw new ApiError(
            409,
            "User with same email id already exists"
        )
    }

    const user = await User.create(
        {
            firstName,
            lastName,
            email,
            role: role || UserRolesEnum.USER,
            password
        }
    )

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -forgotPasswordToken  -emailVerificationToken"
    )

    if(!createdUser)
    {
        throw new ApiError(
            500,
            "Something went wrong while creating user"
        )

    }

    return res.status(200).json(
        new ApiResponse(200, createdUser, "user created successfully!")
    )

})

const loginUser = asyncHandler(async (req, res, next)=>{

    const {email, password} = req.body

    if(!email || !password){
        throw new ApiError(400, "Please fill all the details!")
    }

    const user = await User.findOne({email})

    if(!user){
        throw new ApiError(404, "user not found:(")

    }

    const isPasswordValid = await user.isPasswordCorrect(user.password)

    if(!isPasswordValid)
    {
        throw new ApiError(401, "Incorrect Password!")

    }




})

export {
    registerUser,
    loginUser
}