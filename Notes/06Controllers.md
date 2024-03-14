# Designing Controllers

## To design controller first build a logic around what is needed 🧠? then break down the solution create an algorithm and start implementing it

### Algorithm to register user

-   get the user information from frontend server

    -   Destructure from the req.body

-   validate the user information incase it's missed in frontend

    -   use `if` block to check
    -   you can use `some` to check all of it at once like shown

    ```javascript
    if (
        [fullName, username, email, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(404, "All fields are required");
    }
    ```

-   check if the user already exists

    -   use `findOne` to find the user
    -   $or operator can be used to find by either email or username

    ```javascript
    const existedUser = await User.findOne({
        $or: [{ email }, { username }],
    });
    ```

    -   then check by `if` block

-   check for the images and avatar

    -   get access from `req.files?.filename` - by `multer`
    -   you can use question mark ? or the classic method like below

    ```javascript
    const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverLocalPath;
    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
    ) {
        coverLocalPath = req.files.coverImage[0].path;
    }
    ```

    -   use `if` block if used `?` to check for afterwards

-   upload the images to cloudinary server
    -   call the prebuilt method and pass on the path to it
    -   remember to use `await` as this task can take time
-   create user object on the db with the details
    -   call the `create` method on model and then create an object with required details.
    -   the images will come from the returned `response` on cloudinary with method url or secured_url
    -   study the response too
-   remove the password and refresh tokens field from the details
    -   find the createdUser using `findById` and use select method to remove
    ```javascript
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    ```
-   check for user creation
    -   use classic `if` statement
-   return response
    -   send ApiResponse with status code (200) and other created format for the response
