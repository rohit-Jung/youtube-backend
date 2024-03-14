# Introduction to Database (MongoDB)

## Types of Database

### SQL (Structured Query Language) Database:

-   They are relational database that uses structured format (table-based) to store data. Includes ACID(Atomicity, Consistency, Isolation, Durability) properties.
-   For example, MySQL, SQLite, etc

### NoSQL (Non-Structured Query Language) Database:

-   Conversely, NoSQL databases are non relational database allowing data to store in various formats like key/value pairs, documents, graphs, etc.
-   They can be schema-less or have dynamic Schema(structure)
-   For example, MongoDB, Couchbase, etc

## MongoDB

-   As mentioned MongoDB is a No-SQL database that stores data in flexible format called BSON(Binary JSON). It can handle large chunks of structured and semi-structured data easily. It offers flexibility and scalability.

## Terminologies

Coding DB setup -> sets up DB information
Coding Model -> sets up Collection in Database
Coding Schema -> Sets up documents in Databse

## MONGOOSE (Package)

-   Mongoose is a MongoDB object modeling tool for Node.js.
-   It provides a schema-based solution for interacting with MongoDB databases, simplifying data validation, and offering features like `middleware` and population.
-   We could connect MongoDB, create Schema, Models and then export it easily using mongoose.

## Data Modelling

-   Visualizing the data fields and how they are associated with each other
-   tools like eraser, draw.io, etc are used to model the data diagrammatically
-   we include the fields (Schema), their types and how are one field of one model associated with the other field of another model
    ```javascript
    import mongoose, { Schema } from "mongoose";
    import bcrypt from "bcrypt";
    import jwt from "jsonwebtoken";

    const userSchema = new Schema(
        {
            username: {
                type: String,
                required: true,
                lowercase: true,
                unique: true,
                trim: true,
                index: true,
            },
            email: {
                type: String,
                required: true,
                lowercase: true,
                unique: true,
                trim: true,
            },
            password: {
                type: String,
                required: [true, "Password is required"],
            },
            posts: {
                type: Schema.Types.ObjectId,
                ref: "Posts",
            },
        },
        { timestamps: true }
    );

    export const User = mongoose.model("User", userSchema);
    ```
## Data Association

-   It refers to how we can associate data of one model with another model's data.
-   For instance:

```javascript
field: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "modelReference"
}
```

-   enums: options given to the user
