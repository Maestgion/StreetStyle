import {Router} from "express"
import {
    addCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} from "../controllers/category.controller.js"
import {
    verifyJWT,
    verifyResourcePermission
} from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js"
import {UserRolesEnum} from "../constants.js"

const router = Router()

router.route("/")
      .get(getAllCategories)
      .post(verifyJWT, verifyResourcePermission([UserRolesEnum.ADMIN]), addCategory)

router.route("/:categoryId")
      .get(getCategoryById)
      .patch(verifyJWT, verifyResourcePermission([UserRolesEnum.ADMIN]), upload.fields(
        [
            {
                name: "coverImage",
                maxCount: 1
            }
        ]
      ), updateCategory )
      .delete(verifyJWT, verifyResourcePermission([UserRolesEnum.ADMIN]), deleteCategory)


export default Router
