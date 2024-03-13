import mongoose, { Schema } from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';


const userSchema = new Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String, // we use cloudinary url
    },
    coverImage: {
        type: String,
    },
    watchHistory: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    refreshToken: {
        type: String
    }
}, { timestamps: true })

userSchema.pre("save", async function (next) {  //The pre() function is used to define middleware functions that run before userSchema operations.The hook (or event) on which the middleware should execute (e.g., 'save', 'update', 'findOne', etc.).  A callback function that will be executed before the specified operation.The callback function typically takes the next parameter, which is called when the middleware completes its task.
    if (this.isModified("password")) return next();

    this.password = bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPassword = async function (password) {
    return await bcrypt.compare(password, this.password) // compares the again inputed password with already inputed password (hashed one)
}

userSchema.methods.generateAccessToken = function () {  //  a token is a piece of data that serves as a form of credentials or proof of identity
    return jwt.sign(
        {
            _id: this.id,
            email: this.email,
            userName: this.username,
            fullNmae: this.fullNmae
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function () { 
    return jwt.sign(
        {
            _id: this.id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export default User = mongoose.model('User', userSchema);