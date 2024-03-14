# Setting up the Backend Project on a production level

## Step 1: Create and Initialize Project Folder

To begin, create a new folder for your project and initialize it using npm:

```bash
npm init
```

## Step 2: Install the `dotenv` Package from npm

-   Install the `dotenv` package using npm. It enables you to securely store sensitive environment variables and configuration settings that should not be exposed.

    -   Environment variables act as global variables, influencing the behavior of a running program or process.

    -   **Installing and Configuring the `dotenv` Package**:

        ```bash
        npm install dotenv
        ```

        ```javascript
        // Configuring in index.js
        import dotenv from "dotenv";

        dotenv.config({
            path: "./.env",
        });
        ```

## Step 3: Install the `prettier` Package from npm

-   Install the `prettier` package from npm.

    -   Why use a package instead of an extension?

        -   When working on production-level projects, conflicts can arise during code merges due to syntax, commas, and spaces. Using a package allows for specific configuration tailored to these projects all around.

    -   **Setting up Prettier in Code**:

        ```bash
        npm install -D prettier     # -D for dev dependencies
        ```

        -   Create a `.prettierrc` file and configure it with formatting settings:

            ```json
            {
                "singleQuote": false,
                "bracketSpacing": true,
                "tabWidth": 4,
                "trailingComma": "es5",
                "semi": true
            }
            ```

        -   Create a `.prettierignore` file to exclude specific files from formatting, such as the `.env` file.

## Step 4: Install the `nodemon` Package as a Dev Dependency

```bash
npm install -D nodemon
```

-   **Why nodemon?**

    -   Previously, restarting the server manually after every code changes was a headache.
    -   `nodemon` automates this process by automatically reloading the server upon any code changes, introducing the feature of `hot reloading`.

-   configure the run command to start the project in `package.json`

```json
"dev": "nodemon src/index.js"
```

-   to use the es6 version of dotenv, configure the following too:

```json
"dev": "nodemon -r dotenv/config --experimental-json-modules src/index.js"
```

## Step 5: Set up Folder Structure

In a backend project, maintaining a standardized folder structure is crucial for organization and scalability. Here's a suggested structure:

### Root Directory Folders:

-   **`node_modules`**: Essential modules for Node.js.

-   **`public`**: Contains static assets like stylesheets, JavaScript files, temporary files, and images.

-   **`src`**: Holds the source code for the backend application, including:

    -   **`controllers`**: For handling business logic and processing requests.
    -   **`db`**: Contains modules for database interaction, including connection setup.
    -   **`middlewares`**: Contains middleware functions used in request processing.
    -   **`models`**: Contains data models representing database entities.
    -   **`routes`**: Defines application routes, directing requests to the appropriate controllers.
    -   **`utils`**: Stores utility functions used across the application, such as error handling, response formatting, and file uploading to cloud services.

### Root Directory Files:

-   **`app.js`**: Initializes and configures the backend application.

-   **`constants.js`**: Defines constants and configurations.

-   **`index.js`**: Entry point for the backend application.

-   **`.env`**: File for storing environment variables.
-   **`.prettierrc`**: Configuration file for Prettier code formatter.
-   **`.prettierignore`**: File to specify which files or directories to ignore when formatting code with Prettier.
-   **`package.json`**: Configuration file for npm packages and scripts.
-   **`.gitignore`**: This file specifies files and directories that Git should ignore. It helps exclude files, such as logs and dependencies, .env, node-modules from being included in the repository. Online generators available `.gitignore generators`

## Step 5: Set up `express` and `mongoose`

-   install express from npm.js - Read Documentation for more

    ```bash
    npm install express
    ```

    ```javascript
    //on index.js after connection to database
    //boilerplate code - available on github of express

    import express from "express";
    const app = express();

    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server listening on ${process.env.PORT}`);
    }))
    ```

-   install mongoose from npm.js - Read Documentation for more

    ```bash
    npm install mongoose
    ```

## Step 6: Set up a Remote Database

To set up a remote database for your backend, we'll use MongoDB Atlas, although any similar service can be used.

1. **Create an Account**: Register for an account on MongoDB Atlas or your preferred service.

2. **Connect Backend with Database**:

    - Obtain the connection string provided by the database service.
    - Use this string to connect your backend application to the remote database.

3. **Handle Database Operations Safely**:
    - It's crucial to handle database operations safely due to potential delays and errors.
    - Remember database is always in another continent. - Hitesh Sir
    - Use `try-catch` blocks and `async-await` to manage asynchronous operations and catch any errors that may occur during database interactions.

## Approaches to connect the database

### First Approach

-   connecting the database in index.js itself using `IIFE`

    ```javascript
    import express from "express";
    const app = express()(async () => {
        try {
            await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
            app.on("error", (error) => {
                console.log("ERROR OCCURRED: ", error);
                throw error;
            });

            app.listen(process.env.PORT, () => {
                console.log(`App is listening on port ${process.env.PORT}`);
            });
        } catch (error) {
            console.error("ERROR: ", error);
            throw err;
        }
    })();
    ```

### Second Approach

-   connecting the database in index.js inside db folder

    ```javascript
    //DONE in index.js inside DB folder
    import mongoose from "mongoose";
    import { DB_NAME } from "../constants.js";

    const connectDB = async () => {
        try {
            const connectionInstance = await mongoose.connect(
                `${process.env.MONGODB_URI}/${DB_NAME}`
            );
            console.log(
                `MongoDB connected: ${connectionInstance.connection.host}`
            );
        } catch (error) {
            console.error(`MongoDB connection error: ${error}`);
            process.exit(1);
        }
    };

    export default connectDB;
    ```

## Step 7: Set up `app.js` file:

-   After DB connection and importing the express
-   Since the connect_db in second approach to connect the database returns a `promise` we could use `.then` and `.catch` to listen on a port if the database is connected successfully else console an error message.
-   Install the following packages

```bash
npm i cookie-parser cors
```

-   Setup the following code

```javascript
//import the needed packages

//setup the code

// Using CORS to allow access to backend from specific origins only
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

// To accept JSON data in the backend
app.use(express.json({ limit: "16kb" }));

//the urls are encoded in different format like some browser do + for spaces while some %20.So to parse URL-encoded data with extended mode and limit size
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// To serve static frontend/assets available on the path "public"
app.use(express.static("public"));

// To parse cookies
app.use(cookieParser());
```

## Step 8: Set up `utils` folder

Since we will be using a lot of async functions, we create an `asyncHandler.js` file for it. There are two approaches:

### First Approach - Using Promises

```javascript
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) =>
            next(err)
        );
    };
};
```

### Second Approach - Using Try-Catch

```javascript
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
```

-   Since we are standardizing all aspects, it's better to standardize the error and response messages too. For this, we extend the Error class of Node.js and create our custom error class. Additionally, we create a class for the response message.

    -   **For `APiError.js`**

    ```javascript
    class ApiError extends Error {
        constructor(
            statusCode,
            message = "Something went wrong",
            error = [],
            stack = ""
        ) {
            super(message);
            this.message = message;
            this.statusCode = statusCode;
            this.error = error;
            this.data = null;
            this.success = false;

            if (stack) {
                this.stack = stack;
            } else {
                Error.captureStackTrace(this, this.constructor);
            }
        }
    }

    export { ApiError };
    ```

    -   **For `ApiResponse.js`**

    ```javascript
    class ApiResponse {
        constructor(statusCode, message = "Success", data) {
            this.statusCode = statusCode;
            this.message = message;
            this.data = data;
            this.success = statusCode < 400; //Response Error code is below 400
        }
    }

    export { ApiResponse };
    ```

## Step 9: Write the database models code

-   write the data modelling code according to the models designed
-   to hash and salt password - `bcrypt` and to generate tokens `jsonwebtoken`
    ```bash
    npm install jsonwebtoken bcrypt
    ```
-   use `pre` hook in userModel to encrypt password before saving it to database

    ```javascript
    userSchema.pre("save", async function (next) {
        if (!this.isModified("password")) return; //Done to avoid hashing of passwords if the field specifically is not changed.
        this.password = await bcrypt.hash(this.password, 10);
        next();
    });
    ```

-   create custom methods to decrypt the password and generate jwt tokens

    ```javascript
    //DO NOT USE ARROW FUNCTIONS HERE !! - this keyword is present

    userSchema.methods.isPasswordCorrect = async function (password) {
        return await bcrypt.compare(password, this.password); //Returns true if password is correct else false
    };

    //similarly create methods for generating tokens
    userSchema.methods.functionName = function () {
        return jwt.sign(
            {
                payload: this.dataFromSchema,
            },
            process.env.tokenSecret, //TokenSecret - Randomized string
            {
                expiresIn: process.env.tokenExpiry, //tokenExpiry - time
            }
        );
    };
    ```

-   to unleash the real power of mongoose and use aggregate pipelines

    ```bash
    npm i mongoose-aggregate-paginate-v2
    ```

    -   to use it on specific model import it and use `plugin` hook to integrate it

    ```javascript
    import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

    specificSchema.plugin(mongooseAggregatePaginate);
    ```

### **refer to jwt, bcrypt and mongooseAggregatePaginate github to know more about it and it's usage**

## Step 10: Setting up File Upload Feature if the application backend needs it

Here, we'll first upload the file temporarily to disk storage using an npm package and then upload it to the cloud. If the upload to the cloud is successful, we'll delete (unlink) the file from disk storage.

### Uploading to Local Storage / Disk Storage

Since Express does not support file-type data like images, videos, etc., we'll use another npm package

-   either `multer` or `fileupload`. In this case, we'll use multer:

```bash
npm i multer
```

-   setting up multer middleware
-   why multer as middleware?
-   refer to multer github for more

    ```javascript
    import multer from "multer";

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, "./public/temp"); //destination folder name
        },
        filename: (req, file, cb) => {
            cb(null, file.originalname);
        },
    });

    export const upload = multer({ storage }); //using the feature of es6
    ```

### Uploading to Cloud Storage

Various cloud services such as AWS can be utilized to store files. In this case, we'll be using Cloudinary:

**Set up Cloudinary**

-   Make an account on Cloudinary and follow the provided instructions to install it.
-   Write the configuration code to a file in the `utils` folder.
-   The configuration code can be obtained from the Cloudinary website.

```javascript
//import cloudinary and fs (provided by node itself)

// Configuration code provided by Cloudinary
cloudinary.config({
    cloud_name: process.env.YOUR_CLOUD_NAME,
    api_key: process.env.YOUR_API_KEY,
    api_secret: process.env.YOUR_API_SECRET,
});

//TO upload files on cloudinary and then unlink/delete the temporarily saved file from the local server
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        //Uploading files on cloudinary using uplader method
        const result = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        console.log("File uploaded successfully on cloudinary");
        return result;
    } catch (error) {
        fs.unlinkSync(localFilePath); //removes the local temporary file if the upload fails
    }
};
```

## You can modify the above code as needed. Just refer the github repository of respective package to know more about it. Below are the links to repo:

-   [dotenv](https://github.com/motdotla/dotenv#readme) <br>
-   [nodemon](https://github.com/remy/nodemon) <br>
-   [express](https://github.com/expressjs/express) <br>
-   [cookie-parser](https://github.com/expressjs/cookie-parser#readme) <br>
-   [cors](https://github.com/expressjs/cors#readme) <br>
-   [mongoose](https://github.com/Automattic/mongoose) <br>
-   [multer](https://github.com/expressjs/multer) <br>
-   [bcrypt](https://github.com/kelektiv/node.bcrypt.js) <br>
-   [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken#readme) <br>
-   [mongoose-aggregate-paginate-v2](https://github.com/aravindnc/mongoose-aggregate-paginate-v2#readme) <br>

## SETUP DONE: Now you can start Working on the project: Write controllers logic, aggregation pipelines and use middleware, write routes and so on.
