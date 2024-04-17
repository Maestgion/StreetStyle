import {User} from "../models/user.model.js"
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import { asyncHandler } from "../utils/asyncHandler.js"
import { UserRolesEnum } from "../constants.js"
import { sendMail, emailVerificationContent, forgotPasswordContent } from "../utils/mail.js"


const generateToken = async (userId)=>{
    try{

        const user = await User.findById(userId)

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save()
        return {accessToken, refreshToken}

    }catch(error){
        throw new ApiError(
            500,
            "something went wrong while generating tokens"
        )
    }
}

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


    const {unhashedToken, hashedToken, tokenExpiry} =  user.generateRandomToken()

    user.emailVerificationToken = hashedToken
    user.emailVerificationExpiry = tokenExpiry


    await user.save()

    
    await sendMail({
        email: user?.email,
        subject: "Please verify your email",
        mailgenContent: emailVerificationContent(
          user.firstName,
         `
         ${req.protocol}://${req.host}/api/v1/users/verify-email/${unhashedToken}
         `
        ),
      });


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
        new ApiResponse(200, createdUser, "user created successfully and verification email has been sent!")
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

    const {accessToken, refreshToken} = await generateToken(user._id)

    const options = {
        httpOnly: true,
        secure: true
    }

    const loggedInUser =  await User.findById(user._id).select("-password -refreshToken -forgotPasswordToken  -emailVerificationToken")

    res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken: accessToken,
                refreshToken: refreshToken
            }
        )
    )

})

export {
    registerUser,
    loginUser
}