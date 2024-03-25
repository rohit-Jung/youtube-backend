import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
    try {
        // Build healthcheck response
        const healthcheckResponse = new ApiResponse(
            200,
            "OK",
            "Healthcheck successful"
        );
        // Return healthcheck response
        res.status(200).json(healthcheckResponse);
    } catch (error) {
        // Handle errors
        console.error(error);
        const apiError = new ApiError(500, "Internal server error");
        res.status(apiError.statusCode).json(apiError);
    }
});

export { healthcheck };
