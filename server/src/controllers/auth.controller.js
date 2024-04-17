import {User} from "../models/user.model.js"
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import { asyncHandler } from "../utils/asyncHandler.js"
import { UserRolesEnum } from "../constants.js"
import { sendMail, emailVerificationContent, forgotPasswordContent } from "../utils/mail.js"
import jwt from 'jsonwebtoken'

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

const registerUser = asyncHandler(async (req, res)=>{

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
          `${req.protocol}://${req.get(
            "host"
          )}/api/v1/users/verify-email/${unhashedToken}`
        
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

const loginUser = asyncHandler(async (req, res)=>{

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

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken: accessToken,
                refreshToken: refreshToken
            },
            "user logged in successfully!"
        )
    )

})

const verifyEmail = asyncHandler(async (req, res)=>{

    const {verificationToken} = req.params

    if(!verificationToken)
    {
        throw new ApiError(400, "verification Token is missing!")
    }

    let hashedVerificationToken = crypto.createHash("sha256").update(verificationToken).digest("hex")

    const user = await User.findOne({
        emailVerificationToken: hashedVerificationToken,
        emailVerificationExpiry: {$gt: Date.now()}
        })

    if(!user)
    {
        throw new ApiError(489, "Invalid or expired token")
    }

    user.emailVerificationToken = undefined
    user.emailVerificationExpiry = undefined
    user.isEmailVerified = true

    await user.save()

    return res.status(200).json(
        new ApiResponse(
            200,
            {isEmailVerified: true},
            "email verified successfully"
        )
    )

})

const resendEmailVerification = asyncHandler(async (req, res)=>{
    const user = await User.findById(req.user?._id)

    if(!user)
    {
        throw new ApiError(404, "user not found")
    }

    if(user.isEmailVerified)
    {
        throw new ApiError(409, "email is already verified" )
    }

    const {unhashedToken, hashedToken, tokenExpiry} = user.generateRandomToken()

    user.emailVerificationToken = hashedToken
    user.emailVerificationExpiry = tokenExpiry

    await user.save()

    await sendMail(
        {
            email: user?.email,
            subject: "Please verify your email",
            mailgenContent: emailVerificationContent(
              user.firstName,
              `${req.protocol}://${req.get(
                "host"
              )}/api/v1/users/verify-email/${unhashedToken}`
            
            ),
          }
    )

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "verification mail has been sent to your mail ID"));
})    

const forgotPassword = asyncHandler(async (req, res)=>{
    const {email} = req.body
    const user = await User.findOne({email})

    if(!user)
    {
        throw new ApiError(404, "user not found")
    }

    const {unhashedToken, hashedToken, tokenExpiry} = user.generateToken()

    user.forgotPasswordToken = hashedToken
    user.forgotPasswordExpiry = tokenExpiry

    await user.save()

    await sendMail({
        email: user?.email,
        subject: "Password reset request",
        mailgenContent: forgotPasswordContent(
          user.firstName,
          `${req.protocol}://${req.get(
            "host"
          )}/api/v1/users/reset-password/${unhashedToken}`
        
        ),
      })

    return res.status(200).json(
        new ApiResponse(200, {}, "Password reset Link has been sent!")
    )
})


const resetForgottenPassword = asyncHandler(async (req, res)=>{
    const {resetToken} = req.params
    const {newPassword} = req.body

    if(!resetToken)
    {
        throw new ApiError(400, "password reset token is missing!")
    }

    const hashedResetToken = crypto.createHash("sha256").update(resetToken).digest("hex")

    const user = await User.findOne(
        {
            forgotPasswordToken: hashedResetToken,
            forgotPasswordExpiry: {$gt: Date.now()}
        }
    )

    if(!user)
    {
        throw new ApiErro(489, "Invalid or expired token")
    }

    user.forgotPasswordToken = undefined
    user.forgotPasswordExpiry = undefined

    user.password = newPassword

    await user.save()

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "password reset succesful!"
        )
    )
    
})

const changeCurrentPassword = asyncHandler(async (req, res)=>{
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordValid = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordValid)
    {
        throw new ApiError(400, "invalid old password!")
    }

    user.password = newPassword

    await user.save()

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "password changed successfully!"
        )
    )
   
})

const assignRole = asyncHandler(async (req, res)=>{
    const {userId} = req.params
    const {role} = req.body

    const user = await User.findById(userId)

    if(!user)
    {
        throw new ApiError(404, "user not found")
    }

    user.role = role

    await user.save()

    return res.status(200).json(
        new ApiResponse(200,{}, "user role changed successfully!")
    )

})


const refreshAccessToken = asyncHandler(async (req, res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken)
    {
        throw new ApiError(401, "unauthorized request")
    }

    try{

        const decodedToken =  jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if(!user)
        {
            throw new ApiError(401, "invalid refresh token")
        }

        if(incomingRefreshToken !== user.refreshToken)
        {
            throw new ApiError(401, "invalid refresh token")
        }

        const {accessToken, refreshToken: newRefreshToken} = await generateToken(user._id)

        const options = {
            httpOnly: true,
            secure: true
        }

        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken: accessToken,
                    refreshToken: newRefreshToken
                },

                "access token refreshed successfully!"
            )
        )

    }catch(error){
        throw new ApiError(401, error?.message || "invalid refresh token")
    }
})

const getCurrentUser = asyncHandler(async (req, res)=>{
    const user = req.user

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user: user
            },
            "user retrieved successfully!"
        )
    )
})

const logoutUser = asyncHandler(async (req, res)=>{
    
    await User.findByIdAndUpdate(req.user?._id, {
        $set:{
            refreshToken: undefined
        }
    })

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
           .clearCookie('accessToken', options)
           .clearCookie('refreshToken', options)
           .json(
            new ApiResponse(200, {}, "user logged out successfully!")
           )


})

export {
    registerUser,
    loginUser,
    verifyEmail,
    resendEmailVerification,
    forgotPassword,
    resetForgottenPassword,
    changeCurrentPassword,
    assignRole,
    refreshAccessToken,
    getCurrentUser,
    logoutUser

}