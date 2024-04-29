import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import {uploadOnCloudinary, deleteFromCloudinary} from "../utils/cloudinary.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import {Category} from "../models/category.model.js"
import { getMongoosePaginateOptions } from "../utils/helpers.js";
import mongoose from "mongoose";


const addProduct = asyncHandler(async (req, res)=>{


    const {name, features, description, category, price, stock, shippingDetails, returnDetails, miscellaneousFeatures, careGuide} = req.body

    if([name, features, description, category, price, stock, shippingDetails, returnDetails].some(
        fields => fields=== ""
    )){
        throw new ApiError(400, "Please fill all the product details")
    }

    const categoryExists = await Category.findById(category)

    if(!categoryExists)
    {
        throw new ApiError(404, "category not found!")

    }

    const coverImageLocalPath = req.files?.coverImage[0].path

    if(!coverImageLocalPath)
    {
        throw new ApiError(400, "cover Image is required")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    
    const featuredImages = req.files.featuredImages && req.files.featuredImages?.length ? req.files.featuredImages.map(async (image)=>{
        const response = await uploadOnCloudinary(image.path)
        return {url: response.secure_url, public_id: response.public_id}
    }) : []


    const product = await Product.create(
        {
            name, 
            features,
            description,
            miscellaneousFeatures,
            description,
            category,
            coverImage: {
                url: coverImage.secure_url,
                public_id: coverImage.public_id
            },
            featuredImages, 
            price,
            stock,
            shippingDetails,
            returnDetails,
            careGuide

        }
    )

    return res.status(201).json(
        new ApiResponse(
            201,
            product,
            "product added successfully!!"
        )
    )

})


const getAllProducts = asyncHandler(async (req, res)=>{
    const {page, limit} = req.query

    const aggregatedProducts = Product.aggregate([
        {}
    ])

    const products = await Product.aggregatePaginate(
        aggregatedProducts,
        getMongoosePaginateOptions(
            {
                page,
                limit,
                customLabels: {
                    totalDocs: "totalProducts",
                    doc: "products"
                }
            }
        )
    )

    return res.status(200).json(
        new ApiResponse(
            200,
            products,
            "all products fetched successfully!!"
        )
    )
})


const getProduct = asyncHandler(async (req, res)=>{
    const {productId} = req.params

    const product = await Product.findById(productId)

    if(!productId)
    {
        throw new ApiError(404, "product not found")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            product,
            "product fetched successfully!!"
        )
    )
})


const updateProduct = asyncHandler(async (req, res)=>{
    const {productId} = req.params

    const product = await Product.findById(product)

    if(!product)
    {
        throw new ApiError(404, "product not found")
    }

    const {name, features, description, category, price, stock, shippingDetails, returnDetails, miscellaneousFeatures, careGuide} = req.body

    if([name, features, description, category, price, stock, shippingDetails, returnDetails].some(
        fields => fields=== ""
    )){
        throw new ApiError(400, "Please fill all the product details")
    }

    const categoryExists = await Category.findById(category)

    if(!categoryExists)
    {
        throw new ApiError(404, "category not found!")

    }


    if(req.files['coverImage'] && req.files['coverImage'].length>0)
    {
        if(product.coverImage)
        {
            await deleteFromCloudinary(coverImage.public_id)
        }

        const coverImagePath = req.files.coverImage[0].path

        const coverImage = await uploadOnCloudinary(coverImagePath)

        product.coverImage = {
            url: coverImage.secure_url,
            public_id: coverImage.public_id
        }

    }


    if(req.files['featuredImages'] && req.files['featuredImages'].length>0)
    {
        for(const featImage of product.featuredImages)
        {
            await deleteFromCloudinary(featImage.public_id)
        }

        product.featuredImages = []
        for(const img of req.files.featuredImages)
        {
            const response = await uploadOnCloudinary(img.path)

            featuredImages.push({
                url: response.secure_url,
                public_id: response.public_id
            })
        }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
       productId
    , {
        $set: {
             name, 
            features,
            description,
            miscellaneousFeatures,
            description,
            category,
            coverImage,
            featuredImages, 
            price,
            stock,
            shippingDetails,
            returnDetails,
            careGuide
        }
    }, {new: true})

    res.status(201).json(
        new ApiResponse(
            201,
            updatedProduct,
            "product updated successfully!!"
        )
    )

})


const deleteProduct = asyncHandler(async (req, res)=>{
    const {productId} = req.params

    const product = await Product.findByIdAndDelete(productId)

    if(!product)
    {
        throw new ApiError(404, "product not found")
    }



    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "product deleted successfully"
        )
    )
})


const getProductsByCategory = asyncHandler(async (req, res)=>{
    const {categoryId} = req.params
    const {page, limit} = req.query

    const category = await Category.findById(categoryId)

    if(!category)
    {
        throw new ApiError(
            404,
            "category does not exist"
        )
    }

    const aggregatedProducts = await Product.aggregate([
        {
            $match: {
                category: new mongoose.Types.ObjectId(categoryId)
            }
        }, 
     
    ])

    const products = await Product.aggregatePaginate(
        aggregatedProducts,
        getMongoosePaginateOptions(
            {
                page,
                limit,
                customLabels: {
                    totalDocs:"totalProducts",
                    docs: "products"
                }
            }
        )
    )

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                ...products,
                category
            },
            "category products fetched  successfully!!"
        )
    )

})


const removeFeatImage = asyncHandler(async (req, res)=>{

    const {productId, featImageId} = req.params

    const product = await Product.findById(productId)

    if(!product)
    {
        throw new ApiError(404, "product not found")
    }
 
  const indexToRemove = product.featuredImages.findIndex(img => img.public_id === featImageId);

  if (indexToRemove === -1) {
      throw new ApiError(404, "Feature image not found in the product");
  }

  product.featuredImages.splice(indexToRemove, 1);

  await deleteFromCloudinary(featImageId);


  await product.save();

    await product.save()

    res.status(200).json(
        new ApiResponse(
            200,
            {},
            "feat image removed successfully"
        )
    )
})



export {
    addProduct,
    getAllProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
    removeFeatImage
}


