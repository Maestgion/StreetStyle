import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();
router.use(verifyJWT)

router.route("/").get(getProfile).patch(updateAccount);

router.route("/my-orders").get(verifyJWT, getAllOrders)

      

export default router