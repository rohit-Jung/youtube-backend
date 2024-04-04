import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Function to get all comments for a video
const getVideoComments = asyncHandler(async (req, res) => {
    // Extract videoId from request parameters
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate videoId
    if (!videoId) {
        throw new ApiError(400, "videoId is required for fetching comments");
    }

    // Find the video by videoId
    const videoFound = await Video.findById(videoId);
    if (!videoFound) {
        throw new ApiError(400, "Video does not exist");
    }

    // Aggregate to fetch comments for the video along with owner details and likes
    const allCommentsFound = await Comment.aggregate([
        { $match: { video: mongoose.Types.ObjectId(videoId) } },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
            },
        },
        { $addFields: { owner: { $first: "$owner" } } },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likedBy",
            },
        },
        { $skip: (page - 1) * limit },
        { $limit: limit },
    ]);

    // Handle case when no comments are found
    if (!allCommentsFound || allCommentsFound.length === 0) {
        throw new ApiError(404, "No comments found for the video");
    }

    // Send success response with the comments
    res.status(200).json(
        new ApiResponse(200, allCommentsFound, "Comments found")
    );
});

// Function to add a comment to a video
const addComment = asyncHandler(async (req, res) => {
    // Extract videoId and commentData from request parameters and body
    const { videoId } = req.params;
    const { commentData } = req.body;

    // Validate videoId, commentData, and existence of the video
    if (!videoId || !commentData) {
        throw new ApiError(400, "Video ID and commentData are required");
    }
    const videoFound = await Video.findById(videoId);
    if (!videoFound) {
        throw new ApiError(400, "Video required for commenting does not exist");
    }

    // Create a new comment
    const commentCreated = await Comment.create({
        content: commentData,
        video: videoFound._id,
        owner: req.user?._id,
    });

    // Handle case when comment creation fails
    if (!commentCreated) {
        throw new ApiError(500, "Error occurred while creating comment");
    }

    // Send success response with the created comment
    res.status(201).json(
        new ApiResponse(201, commentCreated, "Comment successfully created")
    );
});

// Function to update a comment
const updateComment = asyncHandler(async (req, res) => {
    // Extract commentId and new comment from request parameters and body
    const { commentId } = req.params;
    const { newComment } = req.body;

    // Validate commentId and newComment
    if (!commentId || !newComment) {
        throw new ApiError(400, "Comment ID and new comment are required");
    }

    // Find the comment by commentId
    const commentFound = await Comment.findById(commentId);
    if (!commentFound) {
        throw new ApiError(404, "Comment not found");
    }

    // Ensure that only the owner can update the comment
    if (commentFound.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Only the owner can update the comment");
    }

    // Update the comment content
    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        { $set: { content: newComment } },
        { new: true }
    );

    // Handle case when comment update fails
    if (!updatedComment) {
        throw new ApiError(500, "Error occurred while updating comment");
    }

    // Send success response with the updated comment
    res.status(200).json(
        new ApiResponse(200, updatedComment, "Comment updated successfully")
    );
});

// Function to delete a comment
const deleteComment = asyncHandler(async (req, res) => {
    // Extract commentId from request parameters
    const { commentId } = req.params;

    // Validate commentId
    if (!commentId) {
        throw new ApiError(400, "Comment ID is required for deletion");
    }

    // Find the comment by commentId
    const commentFound = await Comment.findById(commentId);
    if (!commentFound) {
        throw new ApiError(404, "Comment not found");
    }

    // Ensure that only the owner can delete the comment
    if (commentFound.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Only the owner can delete the comment");
    }

    // Delete the comment
    const deletion = await Comment.findByIdAndDelete(commentId);

    // Handle case when comment deletion fails
    if (!deletion) {
        throw new ApiError(500, "Error occurred while deleting comment");
    }

    // Send success response after deleting the comment
    res.status(200).json(new ApiResponse(200, "Comment successfully deleted"));
});

// Export functions to be used as route handlers
export { getVideoComments, addComment, updateComment, deleteComment };
