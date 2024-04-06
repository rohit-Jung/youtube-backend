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

            return res
                .status(200)
                .json(new ApiResponse(200, unsubscribe, "Unsubscribed"));
        } else {
            // Subscribe
            const subscription = await Subscription.create({
                subscriber: req.user._id,
                channel: channelId,
            });

            if (!subscription) {
                throw new ApiError(400, "Subscription failed");
            }

            return res
                .status(200)
                .json(new ApiResponse(200, subscription, "Subscribed"));
        }
    } catch (error) {
        // Handle errors
        throw new ApiError(500, "Error toggling subscription", error);
    }
});

// Retrieve subscribers of a channel
const getChannelSubscribers = asyncHandler(async (req, res) => {
    try {
        const { channelId } = req.params;

        if (!isValidObjectId(channelId)) {
            throw new ApiError(400, "Invalid channelId");
        }

        // Find subscribers for the specified channel
        const subscribers = await Subscription.find({
            channel: channelId,
        }).populate({
            path: "subscriber",
            select: "fullName username", // Specify the fields to populate
        });

        const subscriberCount = subscribers.length;

        if (subscriberCount === 0) {
            // Handle if no subscriber is found
            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        null,
                        "No subscribers found for the channel"
                    )
                );
        }

        // Extract subscriber details from subscribers and respond
        const subscriberDetails = subscribers.map(
            (subscription) => subscription.subscriber
        );

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { subscribers: subscriberDetails, subscriberCount },
                    "Subscribers fetched"
                )
            );
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
            subscriber: subscriberId,
        }).populate({
            path: "channel",
            select: "username fullName",
        });

        if (!subscribedChannels || subscribedChannels.length === 0) {
            // Handle the subscriber not found
            return res
                .status(200)
                .json(
                    new ApiResponse(200, null, "No subscribed channels found")
                );
        }

        // Extract channel details from subscribedChannels and respond
        const channels = subscribedChannels.map(
            (subscription) => subscription.channel
        );
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { subscribedChannels: channels },
                    "Subscribed channels fetched"
                )
            );
    } catch (error) {
        // Handle errors
        throw new ApiError(500, "Error retrieving subscribed channels", error);
    }
});

export { toggleSubscription, getChannelSubscribers, getSubscribedChannels };
