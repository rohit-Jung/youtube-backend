import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Controller to get channel statistics
const getChannelStats = asyncHandler(async (req, res) => {
    try {
        const userId = req.user?._id;

        // Get total videos and views
        const videoStats = await Video.aggregate([
            { $match: { owner: mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: null,
                    totalVideos: { $sum: 1 },
                    totalViews: { $sum: "$views" },
                },
            },
        ]);

        // Get total subscribers
        const subscriberCount = await Subscription.countDocuments({
            channel: userId,
        });

        // Get total likes for videos, comments, and tweets
        const totalVideoLikes = await getLikesCount(Video, userId, "video");
        const totalCommentLikes = await getLikesCount(
            Comment,
            userId,
            "comment"
        );
        const totalTweetLikes = await getLikesCount(Tweet, userId, "tweet");

        const stats = {
            totalVideos: videoStats.length ? videoStats[0].totalVideos : 0,
            totalViews: videoStats.length ? videoStats[0].totalViews : 0,
            totalSubscribers: subscriberCount,
            totalVideoLikes,
            totalCommentLikes,
            totalTweetLikes,
        };

        res.status(200).json(
            new ApiResponse(
                200,
                stats,
                "Channel statistics fetched successfully"
            )
        );
    } catch (error) {
        console.error(error);
        throw new ApiError(500, "Failed to fetch channel statistics", error);
    }
});

// Helper function to get total likes for a given model
const getLikesCount = async (model, userId, field) => {
    const likes = await model.aggregate([
        { $match: { owner: mongoose.Types.ObjectId(userId) } },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: field,
                as: "likes",
            },
        },
        { $unwind: "$likes" },
        { $count: "totalLikes" },
    ]);
    return likes.length ? likes[0].totalLikes : 0;
};

// Controller to get channel videos
const getChannelVideos = asyncHandler(async (req, res) => {
    try {
        const userId = req.user?._id;
        const videos = await Video.find({ owner: userId });

        if (!videos || videos.length === 0) {
            return res
                .status(200)
                .json(
                    new ApiResponse(200, [], "No videos found for the channel")
                );
        }

        res.status(200).json(
            new ApiResponse(200, videos, "Channel videos fetched successfully")
        );
    } catch (error) {
        console.error(error);
        throw new ApiError(500, "Failed to fetch channel videos", error);
    }
});

export { getChannelStats, getChannelVideos };
