import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import Jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
    try {

        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong!! while generating refresh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // get user detail from frontend
    // validation - not empty string or input
    // check if user already exists : username , email
    // check for images, check and avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res
    const { fullName, email, username, password } = req.body// req.body sees for the data coming from form or json
    console.log(email);

    // validation - not empty string or input
    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    // check if user already exists : username , email
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User already exists")
    }

    // check for images, check and avatar
    const avatarLocalPath = req.files?.avatar[0]?.path // this req.files is special feature given by multer middleware that we used in user.routes.js for checking files before taking avatar in database.
    // const coverImageLocalPath = req.fileYs?.coverImage[0]?.path // .path Retrieves the local path where the uploaded file is temporarily stored on the server with field name coverImage. [0] means first file that is uploaded

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }


    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is not uploded")
    }

    // upload them to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar is not uploded")
    }

    // create user object - create entry in db and therefore data in it will be available to the user
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    // remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Sucessfully")
    )

})

const loginUser = asyncHandler(async (req, res) => {
    // req body for data
    // useerrname or email
    // find the user
    // password check
    // generate acess and refresh token
    // send cookie

    const { email, username, password } = req.body

    if (!username && !email) {
        throw new ApiError(400, "Username or email is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(400, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Password incorrect")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    ) // Here we querry the database again to get the updated user object that is to passed or shown to client side , becos when we were querrying database at line 111 , we were getting empty refreshToken as we are calling filled refreshToken at line 125 .

    const options = {
        httpOnly: true,
        secure: true // Cookies can be modified in server only and not in client side(Which was by default)

    }
    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refeshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true,
        }
    )

    const options = {
        httpOnly: true,
        secure: true // Cookies can be modified in server only and not in client side(Which was by default)
    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refeshToken", options)
        .json(
            new ApiResponse(
                200,
                {
                },
                "User logged out successfully"
            )
        )

})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incommingRefreshToken = req.cookies.refreshToken || req.body.refreshToken // taking encrypted refresh token from either cookies or from body.

    if (!incommingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = Jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET) // After verifying the encoded refresh token and real refersh token that is inside the .env file as secured key. decodeedToken will contain the decoded refresh token data (i.e the json payload i.e; the user data passed in jwt.sign in refeshToken method inside the user.models.js) 
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incommingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken , newrefreshToken} = await generateAccessAndRefreshToken(user._id)
    
        return res
            .status(200)
            .cookie("accessToken", accessToken)
            .cookie("refreshToken", newrefreshToken)
            .json(
                new ApiResponse(
                    200,
                    {accessToken , refreshToken: newrefreshToken},
                    "Acess token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message ||
            "Can not refresh Token. Its invalid")
    }

})

export { registerUser, loginUser, logoutUser ,refreshAccessToken }