import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError}  from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    // get user detail from frontend
    // validation - not empty string or imput
    // check if user already exists : username , email
    // check for images, check andavatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res
    const {fullName, email, username, password} = req.body// req.body sees for the data coming from form or json
    console.log(email);

    if( [fullName, email, username, password].some((field) => field?.trim() ==="") )
    {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = User.findOne({
        $or: [{username}, {email}]
    })

    if(existedUser) {
        throw new ApiError(409 , "User already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path // this req.files is special feature given by multer middleware that we used in user.routes.js for checking files before taking avatar in database.
    const coverImageLocalPath = req.files?.coverImage[0]?.path // .path Retrieves the local path where the uploaded file is temporarily stored on the server with field name coverImage. [0] means first file that is uploaded

    if(!avatarLocalPath) {
        throw new ApiError( 400, "Avatar is not uploded")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar)
    {
        throw new ApiError( 400, "Avatar is not uploded")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coveImage: coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser = await User.findById(user_id).select(
        "-password -refreshToken"
    )  

    if(!createdUser) {
        throw new ApiError( 500, "Something went wrong while registering the user")
    }

        return res.status(201).json(
            new ApiResponse(200, createdUser , "User registered Sucessfully")
        )

})

export { registerUser}