import mongoose from "mongoose";
import {CouponTypeEnum, AvailableCouponTypes } from "../constants";

const couponSchema = new mongoose.Schema({
   name: {
    type: String,
    required: true,
   },
   code: {
    type: String,
    required: true,
    unique:true,
    trim: true,
    uppercase: true
   },
   type: {
    type: String,
    enum: AvailableCouponTypes,
    default: CouponTypeEnum.FLAT
   },
   discountValue: {
    type: Number,
    required: true,
   }, 
   minCartValue: {
    type: Number,
    default: 0
   },
   startDate: {
    type: Date,
    default: Date.now,
   },
   endDate: {
    type: Date,
    default: null
   },
   isActive: {
    type: Boolean,
    default: true
   }

}, {timestamps: true})

export const Coupon = mongoose.model("Coupon", couponSchema)