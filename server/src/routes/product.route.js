import {Router} from "express"
import {
    addProduct,
    getAllProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
    removeFeatImage
    
} from "../controllers/product.controller.js"
import {
    verifyJWT,
    verifyResourcePermission
} from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"
import {
    UserRolesEnum,
    MAX_FEAT_IMAGE_COUNT
} from "../constants.js"

const router = Router()

router.route("/")
      .get(getAllProducts)
      .post(
        verifyJWT,
        verifyResourcePermission([UserRolesEnum.ADMIN]),
        upload.fields(
            [
                {
                    name: "coverImage",
                    maxCount: 1
                }, 
                {
                    name: "featuredImages",
                    maxCount: MAX_FEAT_IMAGE_COUNT
                }
            ]
        ),
        addProduct
      )


router.route("/:productId")
      .get(getProduct)
      .patch(
        verifyJWT,
        verifyResourcePermission([UserRolesEnum.ADMIN]),
        upload.fields(
            [
                {
                    name: "coverImage",
                    maxCount: 1
                }, 
                {
                    name: "featuredImages",
                    maxCount: MAX_FEAT_IMAGE_COUNT
                }
            ]
        ),
        updateProduct
      )
      .delete(
        verifyJWT,
        verifyResourcePermission([UserRolesEnum.ADMIN]),
        deleteProduct
      )


router.route("/category/:categoryId")
      .get(getProductsByCategory)


router.route("/remove/:featImageId/:productId/:featImageId")
      .patch(
        verifyJWT,
        verifyResourcePermission([UserRolesEnum.ADMIN]),
        removeFeatImage
      )


export default Router;