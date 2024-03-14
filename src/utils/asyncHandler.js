//Using promises
// const asyncHandler = (requestHandler) => {
//     return (req, res, next) => {
//         Promise.resolve(requestHandler(req, res, next)).catch((err) =>
//             next(err)
//         );
//     };
// };

const asyncHandler = (fnc) => async (req, res, next) => {
    try {
         await fnc(req, res, next);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message,
            success: false,
        });
    }
};

export { asyncHandler };
