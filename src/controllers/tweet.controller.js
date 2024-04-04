import mongoose from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

// Function to create a new tweet
const createTweet = asyncHandler(async (req, res) => {
    // Extract tweet content from request body
    const { tweetcontent } = req.body;

    // Validate tweet content
    if (!tweetcontent) {
        throw new ApiError(400, "tweetContent is required");
    }

    // Create a new tweet document
    const tweetCreated = await Tweet.create({
        owner: req.user?._id,
        content: tweetcontent,
    });

    // Handle case when tweet creation fails
    if (!tweetCreated) {
        throw new ApiError(500, "Problem creating tweet");
    }

    // Send success response with the created tweet
    res.status(201).json(
        new ApiResponse(201, tweetCreated, "Tweet created successfully")
    );
});

// Function to get tweets of a specific user
const getUserTweets = asyncHandler(async (req, res) => {
    // Extract userId from request parameters
    const { userId } = req.params;

    // Validate userId
    if (!userId) {
        throw new ApiError(400, "UserId is required for fetching tweets");
    }

    // Find the user by userId
    const user = await User.findById(userId);

    // Handle case when user is not found or unauthorized
    if (!user || user._id.toString() !== req.user._id.toString()) {
        throw new ApiError(404, "User not found or unauthorized");
    }

    // Find tweets belonging to the user
    const userTweets = await Tweet.find({ owner: userId }, { content: 1 });

    // Handle case when user has no tweets
    if (!userTweets) {
        throw new ApiError(404, "User tweets not found");
    }

    // Send success response with user's tweets
    res.status(200).json(new ApiResponse(200, userTweets, "User tweets"));
});

// Function to update a tweet
const updateTweet = asyncHandler(async (req, res) => {
    // Extract tweetId and tweetData from request parameters and body
    const { tweetId } = req.params;
    const { tweetData } = req.body;

    // Validate tweetId and tweetData
    if (!tweetId || !tweetData) {
        throw new ApiError(400, "Tweet ID and tweetData are required");
    }

    // Find the tweet by tweetId
    const tweetFound = await Tweet.findById(tweetId);

    // Handle case when tweet is not found or unauthorized
    if (
        !tweetFound ||
        tweetFound.owner.toString() !== req.user?._id.toString()
    ) {
        throw new ApiError(404, "Tweet not found or unauthorized");
    }

    // Update the tweet content
    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        { $set: { content: tweetData } },
        { new: true }
    );

    // Handle case when tweet update fails
    if (!updatedTweet) {
        throw new ApiError(500, "Problem updating tweet");
    }

    // Send success response with updated tweet
    res.status(200).json(
        new ApiResponse(200, updatedTweet, "Tweet updated successfully")
    );
});

// Function to delete a tweet
const deleteTweet = asyncHandler(async (req, res) => {
    // Extract tweetId from request parameters
    const { tweetId } = req.params;

    // Validate tweetId
    if (!tweetId) {
        throw new ApiError(400, "Tweet ID is required");
    }

    // Find and delete the tweet by tweetId
    const tweetDeleted = await Tweet.findByIdAndDelete(tweetId);

    // Handle case when tweet is not found or unauthorized
    if (
        !tweetDeleted ||
        tweetDeleted.owner.toString() !== req.user?._id.toString()
    ) {
        throw new ApiError(404, "Tweet not found or unauthorized");
    }

    // Send success response after deleting the tweet
    res.status(200).json(new ApiResponse(200, "Tweet deleted successfully"));
});

// Export functions to be used as route handlers
export { createTweet, getUserTweets, updateTweet, deleteTweet };
