import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    deleteFromCloudinary,
    uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    //get the user information from frontend server -- Destructure from the req.body
    const { username, email, fullName, avatar, coverImage, password } =
        req.body;

    //validate the userInformation
    if (
        [fullName, username, email, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(404, "All fields are required");
    }

    //Check if the user exists
    const existedUser = await User.findOne({
        $or: [{ email }, { username }],
    });

    if (existedUser) {
        throw new ApiError(409, "User already exists");
    }

    //Check for the images and avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverLocalPath;
    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Please upload an image");
    }

    //Upload Images on Cloudinary
    const avatarOnCloudinary = await uploadOnCloudinary(avatarLocalPath);
    const coverImageOnCloudinary = await uploadOnCloudinary(coverLocalPath);

    //Create user object
    const user = await User.create({
        fullName,
        username: username.toLowerCase(),
        email,
        avatar: avatarOnCloudinary.secure_url,
        coverImage: coverImageOnCloudinary?.secure_url || "",
        password,
    });

    //Remove password and refreshToken field from user details
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    //Check for user creation
    if (!createdUser) {
        throw new ApiError(500, "User not found");
    }

    //Send response status message
    res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!(email || username)) {
        throw new ApiError(400, "Please provide email or username");
    }

    const user = await User.findOne({
        $or: [{ email }, { username }],
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid User Credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
    );

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const Options = {
        httpsOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, Options)
        .cookie("refreshToken", refreshToken, Options)
        .json(
            new ApiResponse(
                200,
                {
                    refreshToken,
                    accessToken,
                    loggedInUser,
                },
                "User Logged In Successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    const user = req.user;

    await User.findOneAndUpdate(
        user._id,
        {
            $unset: {
                refreshToken: 1,
            },
        },
        {
            new: true,
        }
    );

    const Options = {
        httpsOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", Options)
        .clearCookie("refreshToken", Options)
        .json(new ApiResponse(200, {}, "User Logged Out Successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const incomingRefreshToken =
            req.cookies.refreshToken || req.body.refreshToken;

        if (!incomingRefreshToken) {
            throw new ApiError(401, "Unauthenticated request");
        }

        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token");
        }
        // console.log(incomingRefreshToken);
        // console.log(user.refreshToken);

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Token already used or expired");
        }

        const { newRefreshToken, accessToken } =
            await generateAccessAndRefreshToken(user._id);

        const Options = {
            httpsOnly: true,
            secure: true,
        };

        return res
            .status(200)
            .cookie("refreshToken", newRefreshToken, Options)
            .cookie("accessToken", accessToken, Options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken: newRefreshToken,
                    },
                    "Access Token refreshed successfully"
                )
            );
    } catch (error) {
        throw new ApiError(
            401,
            error?.message || "Unable to generate new refresh token"
        );
    }
});

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid User Credentials");
    }
    if (newPassword !== confirmPassword) {
        throw new ApiError(400, "Passwords do not match");
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    res.status(200).json(
        new ApiResponse(200, {}, "Password changed successfully")
    );
});

const getCurrentUser = asyncHandler(async (req, res) => {
    res.status(200).json(
        new ApiResponse(200, req.user, "Successfully fetched user details")
    );
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    //extract find set return
    const { fullName, username, email } = req.body;

    if (!fullName || !username || !email) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            fullName,
            email,
        },
    }).select("-password");

    res.status(200).json(
        new ApiResponse(200, user, "Successfully updated user details")
    );
});

const updateAvatarImage = asyncHandler(async (req, res) => {
    //extract file uploadCloud set return
    const pastImagePath = req.user?.avatar;
    console.log(pastImagePath);

    await deleteFromCloudinary(pastImagePath);

    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Please upload an image");
    }

    const avatarOnCloudinary = await uploadOnCloudinary(avatarLocalPath);

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatarOnCloudinary.secure_url,
            },
        },
        {
            new: true,
        }
    ).select("-password");

    res.status(200).json(
        new ApiResponse(200, user, "Successfully updated avatar")
    );
});
const updateCoverImage = asyncHandler(async (req, res) => {
    //extract file uploadCloud set return
    const pastImagePath = req.user?.coverImage;
    console.log(pastImagePath);

    await deleteFromCloudinary(pastImagePath);

    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Please upload an image");
    }

    const coverImageOnCloudinary =
        await uploadOnCloudinary(coverImageLocalPath);

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImageOnCloudinary.secure_url,
            },
        },
        {
            new: true,
        }
    ).select("-password");

    res.status(200).json(
        new ApiResponse(200, user, "Successfully updated cover image")
    );
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username?.trim()) {
        throw new ApiError(400, "username missing");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase(),
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers",
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscribers",
                as: "subscribedTo",
            },
        },
        {
            $addFields: {
                subscriberCount: {
                    $size: "$subscribers",
                },
                channelsSubscribedTo: {
                    $size: "$subscribedTo",
                },
                isSubscribed: {
                    $cond: {
                        if: {
                            $in: [req.user?._id, "$subscribers.subscriber"],
                        },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            $project: {
                username: 1,
                fullName: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
                isSubscribed: 1,
                subscriberCount: 1,
                channelsSubscribedTo: 1,
            },
        },
    ]);
    if (!channel?.length) {
        throw new ApiError(404, "Channel not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                channel[0],
                "Successfully fetched user channel details"
            )
        );
});

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        fullName: 1,
                                        avatar: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner",
                            },
                        },
                    },
                ],
            },
        },
    ]);
    res.status(200);
    res.json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Successfully fetched user watch history"
        )
    );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvatarImage,
    updateCoverImage,
    getUserChannelProfile,
    getWatchHistory,
};
