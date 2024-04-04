import mongoose from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Controller to create a new playlist
const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    // Validation: Ensure name and description are provided
    if (!name || !description) {
        throw new ApiError(
            400,
            "Name and description are required for playlist creation."
        );
    }

    // Create playlist in the database
    const playlistCreation = await Playlist.create({
        name: name,
        description: description,
        owner: req.user?._id,
        videos: [],
    });

    // Send success response
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlistCreation,
                "Playlist created successfully"
            )
        );
});

// Controller to get all playlists of a user
const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    // Validation: Ensure userId is provided
    if (!userId) {
        throw new ApiError(400, "User ID is required.");
    }

    // Check if user exists
    const userExisted = await User.findById(userId);
    if (!userExisted) {
        throw new ApiError(404, "User not found.");
    }

    // Fetch all playlists of the user
    const userAllPlaylists = await Playlist.find({ owner: userId });

    // If no playlists found, return 404
    if (!userAllPlaylists.length) {
        throw new ApiError(404, "User does not have any playlists.");
    }

    // Send success response
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                userAllPlaylists,
                "User playlists retrieved successfully"
            )
        );
});

// Controller to get a playlist by ID
const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    // Validation: Ensure playlistId is provided
    if (!playlistId) {
        throw new ApiError(400, "Playlist ID is required.");
    }

    // Find playlist by ID
    const playlistGetById = await Playlist.findById(playlistId);
    if (!playlistGetById) {
        throw new ApiError(404, "Playlist not found.");
    }

    // Send success response
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlistGetById,
                "Playlist retrieved successfully"
            )
        );
});

// Controller to add a video to a playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    // Validation: Ensure playlistId and videoId are provided
    if (!playlistId || !videoId) {
        throw new ApiError(400, "Playlist ID and video ID are required.");
    }

    // Fetch playlist by ID
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found.");
    }

    // Fetch video by ID
    const videoFound = await Video.findById(videoId);
    if (
        !videoFound ||
        videoFound.owner.toString() !== req.user?._id.toString()
    ) {
        throw new ApiError(404, "Video not found.");
    }

    // Check if the video already exists in the playlist
    const isVideoExistInPlaylist = playlist.videos.includes(videoId);
    if (isVideoExistInPlaylist) {
        return res
            .status(200)
            .json(
                new ApiResponse(200, "Video already exists in the playlist.")
            );
    }

    // Add video to playlist and save
    playlist.videos.push(videoFound);
    await playlist.save();

    // Send success response
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlist,
                "Video added to playlist successfully."
            )
        );
});

// Controller to remove a video from a playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    // Validation: Ensure playlistId and videoId are provided
    if (!playlistId || !videoId) {
        throw new ApiError(400, "Playlist ID and video ID are required.");
    }

    // Fetch playlist by ID
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found.");
    }

    // Fetch video by ID
    const videoFound = await Video.findById(videoId);
    if (
        !videoFound ||
        videoFound.owner.toString() !== req.user?._id.toString()
    ) {
        throw new ApiError(404, "Video not found.");
    }

    // Check if the video exists in the playlist
    const videoIndex = playlist.videos.findIndex((id) => id === videoId);
    if (videoIndex === -1) {
        throw new ApiError(404, "Video does not exist in the playlist.");
    }

    // Remove video from playlist and save
    playlist.videos.splice(videoIndex, 1);
    await playlist.save();

    // Send success response
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                playlist,
                "Video removed from playlist successfully."
            )
        );
});

// Controller to delete a playlist
const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    // Validation: Ensure playlistId is provided
    if (!playlistId) {
        throw new ApiError(400, "Playlist ID is required.");
    }

    // Find playlist by ID and delete
    const deleteChecker = await Playlist.findByIdAndDelete(playlistId);

    // If playlist not found or deletion failed, throw error
    if (!deleteChecker) {
        throw new ApiError(404, "Unable to delete playlist.");
    }

    // Ensure the user owns the playlist before deletion
    if (deleteChecker.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(
            403,
            "User does not have permission to delete this playlist."
        );
    }

    // Send success response
    return res
        .status(200)
        .json(new ApiResponse(200, null, "Playlist deleted successfully."));
});

// Controller to update a playlist
const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    // Validation: Ensure playlistId, name, and description are provided
    if (!playlistId || !name || !description) {
        throw new ApiError(
            400,
            "Playlist ID, name, and description are required."
        );
    }

    // Find playlist by ID and update
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { name: name, description: description },
        { new: true }
    );

    // If playlist not found or update failed, throw error
    if (!updatedPlaylist) {
        throw new ApiError(404, "Unable to update playlist.");
    }

    // Send success response
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedPlaylist,
                "Playlist updated successfully."
            )
        );
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
};
