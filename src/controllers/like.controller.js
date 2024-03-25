import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";

// Controller to toggle like on a video
const toggleVideoLike = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;

        if (!videoId) {
            throw new ApiError(400, "Video Id is required");
        }

        // Check if videoId is a valid ObjectId
        if (!isValidObjectId(videoId)) {
            throw new ApiError(400, "Invalid Video Id");
        }

        // Find the video in the database
        const video = await Video.findById(videoId);

        // Check if the video exists and is published
        if (!video || !video.isPublished) {
            throw new ApiError(404, "Video not found or not published");
        }

        // Check if the user has already liked the video
        const alreadyLiked = await Like.findOne({
            video: videoId,
            likedBy: req.user._id,
        });

        // If the user has already liked the video, remove the like
        if (alreadyLiked && alreadyLiked.length > 0) {
            await Like.findByIdAndDelete(alreadyLiked, { new: true });
            return res
                .status(200)
                .json(new ApiResponse(true, "User already liked the video."));
        }

        // Like the video
        const likeVideo = await Like.create({
            video: videoId,
            likedBy: req.user._id,
        });

        // Check if video could be liked
        if (!likeVideo) {
            throw new ApiError(401, "Video could not be liked");
        }

        // Respond with success message and liked video data
        return res
            .status(200)
            .json(new ApiResponse(true, "Video liked successfully", likeVideo));
    } catch (error) {
        // Handle errors
        throw new ApiError(401, "Unable to like video", error);
    }
});

// Controller to toggle like on a comment
const toggleCommentLike = asyncHandler(async (req, res) => {
    try {
        const { commentId } = req.params;

        if (!commentId) {
            throw new ApiError(400, "Comment Id is required");
        }

        // Find the comment in the database
        const comment = await Comment.findById(commentId);

        // Check if the comment exists
        if (!comment) {
            throw new ApiError(404, "Comment not found in database");
        }

        // Check if the user has already liked the comment
        const alreadyLiked = await Like.findOne({
            comment: commentId,
            likedBy: req.user._id,
        });

        // If the user has already liked the comment, remove the like
        if (alreadyLiked && alreadyLiked.length > 0) {
            await Like.findByIdAndDelete(alreadyLiked, { new: true });
            return res
                .status(200)
                .json(new ApiResponse(true, "User already liked the comment"));
        }

        // Like the comment
        const likeComment = await Like.create({
            comment: commentId,
            likedBy: req.user._id,
        });

        // Check if comment could be liked
        if (!likeComment) {
            throw new ApiError(404, "Comment could not be liked");
        }

        // Respond with success message and liked comment data
        return res
            .status(200)
            .json(
                new ApiResponse(true, "Comment liked successfully", likeComment)
            );
    } catch (error) {
        // Handle errors
        throw new ApiError(401, "Unable to like comment", error);
    }
});

// Controller to toggle like on a tweet
const toggleTweetLike = asyncHandler(async (req, res) => {
    try {
        const { tweetId } = req.params;

        if (!tweetId) {
            throw new ApiError(404, "Tweet Id could not be obtained");
        }

        // Find the tweet in the database
        const tweet = await Tweet.findById(tweetId);

        // Check if the tweet exists
        if (!tweet) {
            throw new ApiError(404, "Tweet could not be found in database");
        }

        // Check if the user has already liked the tweet
        const alreadyLiked = await Like.findOne({
            tweet: tweetId,
            likedBy: req.user._id,
        });

        // If the user has already liked the tweet, remove the like
        if (alreadyLiked && alreadyLiked.length > 0) {
            await Tweet.findOneAndDelete(alreadyLiked, { new: true });
            return res
                .status(200)
                .json(new ApiResponse(true, "Tweet was already liked"));
        }

        // Like the tweet
        const likeTweet = await Like.create({
            tweet: tweetId,
            likedBy: req.user._id,
        });

        // Check if tweet could be liked
        if (!likeTweet) {
            throw new ApiError(404, "Tweet could not liked");
        }

        // Respond with success message and liked tweet data
        return res
            .status(200)
            .json(new ApiResponse(true, "Tweet liked Successfully", likeTweet));
    } catch (error) {
        // Handle errors
        throw new ApiError(401, "Unable to like tweet", error);
    }
});

// Controller to get all liked videos by a user
const getLikedVideos = asyncHandler(async (req, res) => {
    try {
        // Aggregation pipeline to get all liked videos by the user
        const pipeline = [
            {
                $match: {
                    likedBy: new mongoose.Types.ObjectId(req.user?._id),
                },
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "video",
                    foreignField: "_id",
                    as: "likedVideos",
                },
            },
            {
                $unwind: "$likedVideos",
            },
            {
                $project: {
                    likedVideos: 1,
                },
            },
        ];

        // Execute aggregation pipeline
        const likedVideos = await Like.aggregate(pipeline);

        // If no liked videos found, return appropriate response
        if (!likedVideos) {
            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        "User has no liked videos",
                        likedVideos
                    )
                );
        }

        // Respond with success message and liked videos data
        return res
            .status(200)
            .json(new ApiResponse(200, "User has liked videos", likedVideos));
    } catch (error) {
        // Handle errors
        throw new ApiError(401, "Cannot get liked videos", error);
    }
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
