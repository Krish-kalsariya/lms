import { User } from '../models/user.model.js';
import bcrypt from 'bcryptjs';

//register
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                Message: "Please all filds are required."
            })
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                success: false,
                messge: "User already exists. Please login."
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            name,
            email,
            password: hashedPassword
        });
        return res.status(201).json({
            success: true,
            messge: "User registered successfully."
        })
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            messge: "Something went wrong while registering user."
        })
    }
}

//login
export const login = async (req,res) => {
    try {
        const {email , password } = req.body ;
        if(!email || !password){
            return res.status(400).json({
                success: false,
                message: "Please provide email and password."
            })
        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(400),json({
                success: false,
                message: "User not found. Please register."
            })
        }
        const isPasswordMatched = await bcrypt.compare(password , user.password);
        if(!isPasswordMatched){
            return res.status(400).json({
                success: false,
                message: "Invalid credentials."
            })
        }
        generateToken(user , res , `welcome back , ${user.name}`);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            messge: "Something went wrong while logging in."
        })
    }
}

//logout
export const logout = async (_, res) => {
    try {
        return res.status(200).cookie("token" , "" , {maxAge:0}).json({
            success: true,
            message: "Logged out successfully."
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            messge: "Something went wrong while logging out."
        })
        
    }
}

//get user profile
export const getUserProfile = async (req, res) =>{
    try {
        const userId = req.id;
        const user = await User.findById(userId).select("-password").populate("enrolledCourses");
        if(!user){
            return res.status(404).json({
                success: false,
                message: "Profile not found."
            })
        }
        return res.status(200).json({
            success: true,
            user
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            messge: "Something went wrong while fetching profile."
        })
    }
}

//update profile
export const updateProfile = async (req, res) => {
    try {
        const userId = req.id;
        const {name} = req.body;
        const profilePhoto = req.file;

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found."
            })
        }

        //  extract public id of the old image from the url is it exists;
        if(user.photoUrl){
            const publicId = user.photoUrl.split("/").pop().split(".")[0];
            deleteFromCloudinary(publicId);
        }

        //upload new photo to cloudinary
        const cloudRespone = await uploadMedia(profilePhoto.path);
        const photoUrl = cloudRespone.secure_url;

        const updatedData = {name,photoUrl};
        const upddataUser = await User.findByIdAndUpdate(userId, updatedData, {new:true}).select("-password");

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            user: upddataUser
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            messge: "Something went wrong while updating profile."
        })
    }
}

