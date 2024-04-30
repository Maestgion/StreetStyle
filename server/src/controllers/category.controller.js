import {Category} from "../models/category.model"
import {uploadOnCloudinary, deleteFromCloudinary} from "../utils/cloudinary.js"
import { ApiError } from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const addCategory = asyncHandler(async (req, res)=>{

    const {name} = req.body

    if(!name){
        throw new ApiError(400, "please fill the category name")
    }

    const coverImagePath = req.files?.coverImage[0]?.path

    if(!coverImagePath)
    {
        throw new ApiError(400, "please provide the cover image")
    }

    const coverImage = await uploadOnCloudinary(coverImagePath)

    const category = await Category.create(
        {
            name, 
            coverImage: {
                url: coverImage.secure_url,
                public_id: coverImage.public_id
            }
        }
    )


    return res.status(201).json(
        new ApiResponse(
            201,
            category,
            "category created successfully!!"
        )
    )
    
})


const getAllCategories = asyncHandler(async (req, res)=>{
    
    const result = await Category.find()

    return res.status(200).json(
        new ApiResponse(
            200,
            result,
            "all categories retrieved successfully!!"
        )
    )
})


const getCategoryById = asyncHandler(async (req, res)=>{
    const {categoryId} = req.params

    const category = await Category.findById(categoryId)

    if(!category)
    {
        throw new ApiError(404, "category not found")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            category,
            "category fetched successfully"
        )
    )
})


const updateCategory = asyncHandler(async (req, res)=>{
    const {categoryId} = req.params

    const category = await Category.findById(categoryId)

    if(!category)
    {
        throw new ApiError(404, "category not found")
    }

    const {name } = req.body

    if(req.files["coverImage"] && req.files["coverImage"].length>0)
    {
        await deleteFromCloudinary(category.coverImage.public_id)
        const coverImagePath = req.files.coverImage[0].path

        const coverImage = await uploadOnCloudinary(coverImagePath)

        category.coverImage = {
            url : coverImage.secure_url,
            public_id: public_id
        }
    }

    category.name = name
    await category.save()

    return res.status(200).json(
        new ApiResponse(
            200,
            category,
            "category updated successfully!!"
        )
    )
})


const deleteCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    const category = await Category.findByIdAndDelete(categoryId);
  
    if (!category) {
      throw new ApiError(404, "Category does not exist");
    }
  
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "category deleted successfully"
        )
      );
  });
  



export {
    addCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
}
