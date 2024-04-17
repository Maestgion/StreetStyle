import mongoose from 'mongoose';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { UserRolesEnum, AvailableUserRoles, USER_TEMPORARY_TOKEN_EXPIRY } from '../constants';



const userSchmea = new mongoose.Schema(
    {
        firstName:{
            type: String,
            required: true,
            trim: true
        },
        lastName:{
            type: String,
            required: true,
            trim: true
        },
        email:{
            type: String,
            unique: true,
            required: true,
            trim: true,
            lowercase: true
        },
        role:{
            type: String,
            required: true,
            enum: AvailableUserRoles,
            default: UserRolesEnum.USER
        },
        password:{
            type:String,
            required: true,
            trim: true
        },
        isEmailVerified: {
            type: Boolean, 
            default: false
        },
        refreshToken: {
            type: String
        }, 
        forgotPasswordToken:{
            type: String
        },
        forgotPasswordExpiry:{
            type: Date
        },
        emailVerificationToken:{
            type: String
        },
        emailVerificationExpiry:{
            type: Date
        }
        
    }, 
    {
        timestamps: true
    }
)

userSchmea.pre('save', async function(next){

    if(!this.isModified(this.password)) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()

})


userSchmea.methods.isPasswordCorrect = async function(password){
    return bcrypt.compare(password, this.password)
}


userSchmea.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            password: this.password
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: ACCESS_TOKEN_EXPIRY
        }
    )
}


userSchmea.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: REFRESH_TOKEN_EXPIRY
        }
    )
}



userSchmea.methods.generateRandomToken = function(){

    const unhashedToken = crypto.randomBytes(20).toString("hex")

    const hashedToken = crypto.createHash("sha256").update(unhashedToken).digest("hex")

    const tokenExpiry = Date.now() + USER_TEMPORARY_TOKEN_EXPIRY

    return {unhashedToken, hashedToken, tokenExpiry}
}


export const User = mongoose.model("users", userSchmea)

