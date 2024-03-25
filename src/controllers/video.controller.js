import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// Middleware to validate video ID
const validateVideoId = asyncHandler(async (req, res, next) => {
    const { videoId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    next();
});

// Middleware to check if video exists
const checkVideoExistence = asyncHandler(async (req, res, next) => {
    const { videoId } = req.params;
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }
    req.video = video;
    next();
});

// Controller to get all videos with pagination and filters
const getAllVideos = asyncHandler(async (req, res) => {
    // Extract query parameters from request
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    // Check if userId is provided
    if (!userId) {
        throw new ApiError(400, "User Id is required");
    }

    // Define common aggregation pipeline stages for video aggregation
    const videoCommonAggregation = (req) => {
        const pipeline = [
            // Lookup comments associated with each video
            {
                $lookup: {
                    from: "comments",
                    localField: "_id",
                    foreignField: "video",
                    as: "comments",
                },
            },
            // Lookup likes associated with each video
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "video",
                    as: "likes",
                },
            },
            // Lookup if current user has liked each video
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "video",
                    as: "isLiked",
                    pipeline: [
                        {
                            $match: {
                                likedBy: new mongoose.Types.ObjectId(
                                    req.user?._id
                                ),
                            },
                        },
                    ],
                },
            },
            // Lookup owner details for each video
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "user",
                    pipeline: [
                        {
                            $project: {
                                avatar: 1,
                                email: 1,
                                username: 1,
                            },
                        },
                    ],
                },
            },
            // Add additional fields like likesCount, commentsCount, and isLiked
            {
                $addFields: {
                    user: { $first: "$user" },
                    likesCount: { $size: "$likes" },
                    commentsCount: { $size: "$comments" },
                    isLiked: {
                        $cond: {
                            if: { $gte: [{ $size: "$isLiked" }, 1] },
                            then: true,
                            else: false,
                        },
                    },
                },
            },
        ];

        // Additional pipeline stages based on query parameters
        if (query) {
            pipeline.unshift({
                $match: {
                    title: { $regex: query, $options: "i" },
                },
            });
        }

        if (userId) {
            pipeline.unshift({
                $match: {
                    owner: mongoose.Types.ObjectId(userId),
                },
            });
        }

        if (sortBy) {
            const sortOption = {};
            sortOption[sortBy] = sortType === "desc" ? -1 : 1;
            pipeline.push({
                $sort: sortOption,
            });
        }

        return pipeline;
    };

    // Perform video aggregation with common aggregation pipeline
    const videoAggregation = Video.aggregate(videoCommonAggregation(req));

    // Pagination options
    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        customLabels: {
            totalDocs: "totalVideos",
            docs: "videos",
        },
    };

    // Execute aggregation with pagination options
    const videos = await Video.aggregatePaginate(videoAggregation, options);

    // Respond with paginated video data
    res.status(200).json(
        new ApiResponse(200, videos, "Successfully fetched videos")
    );
});

// Controller to publish a new video
const publishAVideo = asyncHandler(async (req, res) => {
    // Extract title and description from request body
    const { title, description } = req.body;

    // Check if title and description are provided
    if (!(title && description)) {
        return res
            .status(400)
            .json(new ApiError(400, "Please provide title and description"));
    }

    try {
        // Get local paths for video and thumbnail files
        const videoLocalPath = req.files?.videoFile[0]?.path;
        const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

        // Check if video and thumbnail files are uploaded
        if (!videoLocalPath && !thumbnailLocalPath) {
            return res
                .status(400)
                .json(new ApiError(400, "Please upload video and thumbnail"));
        }

        // Upload video and thumbnail files to Cloudinary
        const videoOnCloudinary = await uploadOnCloudinary(videoLocalPath);
        const thumbnailOnCloudinary =
            await uploadOnCloudinary(thumbnailLocalPath);

        // Extract required data from Cloudinary response
        const videoFile = videoOnCloudinary.secure_url;
        const duration = videoOnCloudinary.duration;
        const thumbnail = thumbnailOnCloudinary.secure_url;

        // Create new video document
        const video = await Video.create({
            videoFile,
            thumbnail,
            title,
            description,
            duration,
            owner: req.user?._id,
        });

        // Respond with success message and created video data
        res.status(201).json(
            new ApiResponse(201, video, "Video uploaded successfully")
        );
    } catch (error) {
        console.error(error);
        res.status(500).json(new ApiError(500, "Internal server error"));
    }
});

// Controller to get a video by ID
const getVideoById = asyncHandler(async (req, res) => {
    // Extract videoId from request parameters
    const { videoId } = req.params;

    try {
        // Find video by ID
        const video = await Video.findById(videoId);

        // Check if video exists
        if (!video) {
            throw new ApiError(404, "Video not found");
        }

        // Increment views count for the video
        video.views += 1;
        await video.save();

        // Respond with success message and video data
        res.status(200).json(
            new ApiResponse(200, video, "Video viewed successfully")
        );
    } catch (error) {
        console.error(error);
        // Handle error response
        res.status(
            error instanceof mongoose.Error.CastError
                ? 400
                : error.status || 500
        ).json(
            new ApiError(
                error.status || 500,
                error.message || "Internal server error"
            )
        );
    }
});

// Controller to update a video
const updateVideo = asyncHandler(async (req, res) => {
    // Extract videoId from request parameters
    const { videoId } = req.params;
    // Extract title and description from request body
    const { title, description } = req.body;

    try {
        // Get local path for the thumbnail file
        const thumbnailLocalPath = req.file?.path;

        // Check if thumbnail file is uploaded
        if (!thumbnailLocalPath) {
            throw new ApiError(400, "Invalid thumbnail");
        }

        // Upload thumbnail file to Cloudinary
        const thumbnailOnCloudinary =
            await uploadOnCloudinary(thumbnailLocalPath);
        if (!thumbnailOnCloudinary.secure_url) {
            throw new ApiError(400, "Error uploading thumbnail");
        }

        // Update video document in MongoDB
        const updatedVideo = await Video.findByIdAndUpdate(
            videoId,
            {
                $set: {
                    title,
                    description,
                    thumbnail: thumbnailOnCloudinary.secure_url,
                },
            },
            {
                new: true,
            }
        );

        // Check if video exists
        if (!updatedVideo) {
            throw new ApiError(404, "Video not found");
        }

        // Respond with success message and updated video data
        res.status(200).json(
            new ApiResponse(200, updatedVideo, "Video updated successfully")
        );
    } catch (error) {
        console.error(error);
        // Handle error response
        res.status(
            error instanceof mongoose.Error.CastError
                ? 400
                : error.status || 500
        ).json(
            new ApiError(
                error.status || 500,
                error.message || "Internal server error"
            )
        );
    }
});

// Controller to delete a video
const deleteVideo = asyncHandler(async (req, res) => {
    // Extract videoId from request parameters
    const { videoId } = req.params;

    try {
        // Ensure videoId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(videoId)) {
            throw new ApiError(400, "Invalid video ID");
        }

        // Delete video document from MongoDB
        const deletedVideo = await Video.findByIdAndDelete(videoId);

        // Check if video exists
        if (!deletedVideo) {
            throw new ApiError(404, "Video not found");
        }

        // Respond with success message and deleted video data
        res.status(200).json(
            new ApiResponse(200, deletedVideo, "Video deleted successfully")
        );
    } catch (error) {
        console.error(error);
        // Handle error response
        res.status(
            error instanceof mongoose.Error.CastError
                ? 400
                : error.status || 500
        ).json(
            new ApiError(
                error.status || 500,
                error.message || "Internal server error"
            )
        );
    }
});

// Controller to toggle publish status of a video
const togglePublishStatus = asyncHandler(async (req, res) => {
    // Extract videoId from request parameters
    const { videoId } = req.params;

    try {
        // Ensure videoId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(videoId)) {
            throw new ApiError(400, "Invalid video ID");
        }

        // Find the video document by ID
        const video = await Video.findById(videoId);

        // Check if video exists
        if (!video) {
            throw new ApiError(404, "Video not found");
        }

        // Toggle the publish status
        video.isPublished = !video.isPublished;

        // Save the updated video document
        await video.save();

        // Respond with the updated publish status
        res.status(200).json(
            new ApiResponse(
                200,
                video.isPublished,
                "Publish status toggled successfully"
            )
        );
    } catch (error) {
        console.error(error);
        // Handle error response
        res.status(
            error instanceof mongoose.Error.CastError
                ? 400
                : error.status || 500
        ).json(
            new ApiError(
                error.status || 500,
                error.message || "Internal server error"
            )
        );
    }
});

export {
    validateVideoId, //new
    checkVideoExistence, //new
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};
