import mongoose from "mongoose";
import {AvailableOrderStatuses, AvailablePaymentProviders, OrderStatusEnum, PaymentProviderEnum} from "../constants"

const orderSchema = new mongoose.Schema({
   price:{
    type: Number,
    required: true
   },
   couponCode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Coupon",
    default: null
   },
   discountedPrice:{
    type: Number,
    required: true
   },
   user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
   },
   items: {
    type: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
            },
            qunatity:{
                type: Number,
                required: true,
                min: [1, "quantity can't be less than 1"],
                default: 1
            }
        }
       ],
    default: []
   }, 
   address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    required: true
   },
   status: {
    type: String,
    enum: AvailableOrderStatuses,
    default: OrderStatusEnum.PENDING,
  },
  paymentProvider: {
    type: String,
    enum: AvailablePaymentProviders,
    default: PaymentProviderEnum.UNKNOWN,
  },
  paymentId: {
    type: String,
  },
  isPaymentSuccessful: {
    type: Boolean,
    default: false,
  },

}, {timestamps: true})

export const Order = mongoose.model("Order", orderSchema)