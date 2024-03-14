import { Router } from "express";
import {
    changePassword,
    getCurrentUser,
    getUserChannelProfile,
    getWatchHistory,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateAccountDetails,
    updateAvatarImage,
    updateCoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    registerUser
);

router.route("/login").post(loginUser);

//Secured routes
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/new-tokens").post(refreshAccessToken);

router.route("/change-password").post(verifyJWT, changePassword);

router.route("/get-user").get(verifyJWT, getCurrentUser);

router.route("/update-details").patch(verifyJWT, updateAccountDetails);

router
    .route("/update-avatar")
    .patch(verifyJWT, upload.single("avatar"), updateAvatarImage);

router
    .route("/update-cover")
    .patch(verifyJWT, upload.single("coverImage"), updateCoverImage);

router.route("/c/:username").get(verifyJWT, getUserChannelProfile);
router.route("/watch-history").get(verifyJWT, getWatchHistory);

export default router;
