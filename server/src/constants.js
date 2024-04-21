export const UserRolesEnum = {
    ADMIN: 'ADMIN',
    USER: 'USER' 

}

export const AvailableUserRoles = Object.values(UserRolesEnum)

export const USER_TEMPORARY_TOKEN_EXPIRY = 20 * 60 * 1000; 

export const ProductSizeEnum = {
    SMALL: 'SMALL',
    MEDIUM: 'MEDIUM',
    LARGE: 'LARGE',
    EXTRA_LARGE: 'EXTRA_LARGE'
}

export const ProductSizeEnumValues = Object.values(ProductSizeEnum)


export const OrderStatusEnum = {
    PENDING: "PENDING",
    CANCELLED: "CANCELLED",
    DELIVERED: "DELIVERED",
  };

  export const AvailableOrderStatuses = Object.values(OrderStatusEnum);

  export const PaymentProviderEnum = {
    UNKNOWN: "UNKNOWN",
    RAZORPAY: "RAZORPAY",
    PAYPAL: "PAYPAL",
  };
  
  export const AvailablePaymentProviders = Object.values(PaymentProviderEnum);

  export const CouponTypeEnum = {
    FLAT: "FLAT",
    PERCENTAGE: "PERCENTAGE",
  };
  
  export const AvailableCouponTypes = Object.values(CouponTypeEnum);