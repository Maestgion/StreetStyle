import {Router} from "express"
import {
    verifyJWT,
} from "../middlewares/auth.middlewares.js"
import {
    getCartItems,
    addToCart,
    removeFromCart,
    removeAllFromCart

} from "../controllers/cart.controllers.js"

const router = Router();

router.route("/add")
      .post(verifyJWT, addToCart)
router.route("/remove")
      .delete(verifyJWT, removeFromCart)
router.route("/remove-all")
      .delete(verifyJWT, removeAllFromCart)
router.route("/view")
      .get(verifyJWT, getCartItems)


export default router;
