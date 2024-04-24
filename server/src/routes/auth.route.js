import {Router} from 'express'
import {
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
} from "../controllers/auth.controller"
import {
    verifyJWT,
verifyResourcePermission
} from "../middlewares/auth.middleware"
import { UserRolesEnum } from '../constants'


const router = Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)


router.route("/verify-email/:verificationToken").post(verifyEmail)
router.route("/resend-email-verification").post(verifyJWT, resendEmailVerification)


router.route("/forgot-password").post(forgotPassword)
router.route("/reset-password/:resetToken").post(resetForgottenPassword)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)


router.route("/assign-role/:userId").post(verifyJWT, verifyResourcePermission([UserRolesEnum.ADMIN]), assignRole)


router.route("/refresh-access-token").post(refreshAccessToken)


router.route("/current-user").get(verifyJWT, getCurrentUser)

router.route("/logout").post(verifyJWT, logoutUser)