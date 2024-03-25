import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Toggle subscription for a channel
const toggleSubscription = asyncHandler(async (req, res) => {
    try {
        const { channelId } = req.params;

        if (!isValidObjectId(channelId)) {
            throw new ApiError(400, "Invalid channelId");
        }

        // Check if the channel exists
        const channel = await User.findById(channelId);
        if (!channel) {
            throw new ApiError(404, "Channel not found");
        }

        // Check if the user is already subscribed
        const isSubscribed = await Subscription.exists({
            channel: channelId,
            subscriber: req.user._id,
        });

        if (isSubscribed) {
            // Unsubscribe
            const unsubscribe = await Subscription.findOneAndDelete({
                channel: channelId,
                subscriber: req.user._id,
            });

            if (!unsubscribe) {
                throw new ApiError(400, "Unsubscribe failed");
            }

            // Remove subscriber from channel's subscribers list
            await User.findByIdAndUpdate(channelId, {
                $pull: { subscriber: req.user._id },
            });

            // Remove channel from user's subscribed channels list
            await User.findByIdAndUpdate(req.user._id, {
                $pull: { subscribeTo: channelId },
            });

            return res
                .status(200)
                .json(new ApiResponse(200, null, "Unsubscribed"));
        } else {
            // Subscribe
            const subscription = await Subscription.create({
                subscriber: req.user._id,
                channel: channelId,
            });

            if (!subscription) {
                throw new ApiError(400, "Subscription failed");
            }

            // Add subscriber to channel's subscribers list
            await User.findByIdAndUpdate(channelId, {
                $push: { subscriber: req.user._id },
            });

            // Add channel to user's subscribed channels list
            await User.findByIdAndUpdate(req.user._id, {
                $push: { subscribeTo: channelId },
            });

            return res
                .status(200)
                .json(new ApiResponse(200, null, "Subscribed"));
        }
    } catch (error) {
        // Handle errors
        throw new ApiError(500, "Error toggling subscription", error);
    }
});

// Retrieve subscribers of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    try {
        const { channelId } = req.params;

        if (!isValidObjectId(channelId)) {
            throw new ApiError(400, "Invalid channelId");
        }

        // Find subscriptions for the specified channel
        const subscriptions = await Subscription.find({ channel: channelId });
        if (!subscriptions || subscriptions.length === 0) {
            throw new ApiError(404, "No subscriptions found for the channel");
        }

        // Extract subscriber IDs from subscriptions
        const subscriberIds = subscriptions.map(
            (subscription) => subscription.subscriber
        );

        // Find users based on the extracted subscriber IDs
        const subscribers = await User.find({ _id: { $in: subscriberIds } });

        return res
            .status(200)
            .json(new ApiResponse(200, subscribers, "Subscribers fetched"));
    } catch (error) {
        // Handle errors
        throw new ApiError(500, "Error getting channel subscribers", error);
    }
});

// Retrieve channels subscribed by a user
const getSubscribedChannels = asyncHandler(async (req, res) => {
    try {
        const { subscriberId } = req.params;

        if (!isValidObjectId(subscriberId)) {
            throw new ApiError(400, "Invalid subscriberId");
        }

        // Find the subscribed channels for the specified subscriberId
        const subscribedChannels = await Subscription.find({
            subscribers: subscriberId,
        }).populate("channel");
        if (!subscribedChannels || subscribedChannels.length === 0) {
            throw new ApiError(404, "No subscribed channels found");
        }

        // Extract the channel details from the subscribedChannels array
        const channels = subscribedChannels.map(
            (subscription) => subscription.channel
        );

        return res
            .status(200)
            .json(
                new ApiResponse(200, channels, "Subscribed channels fetched")
            );
    } catch (error) {
        // Handle errors
        throw new ApiError(500, "Error retrieving subscribed channels", error);
    }
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
