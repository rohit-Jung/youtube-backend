import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    //Check for video id
    //if found search it in database
    //check if published and for found
    //check for like in the video in Like Model
    //if already liked or userliked.length > 0 delete the userAlreadyLiked
    //return response
    //create a video like for user in Like Model [liked by and videoId]
    //check if video is liked
    // return response
    //do this in try catch

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    //same as above


})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    //same as above

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    //write aggreagtion pipeline
    //match the videos with liked by
    //look up in video model for id as [liked videos]
    //unwind liked videos
    //project video like video as 1
    //chceck for aggregation
    //return response
    //do this in try catch
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}