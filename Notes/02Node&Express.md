# Introduction to Backend and Node Js

## What is backend?

-   Works related to server and database

## Why backend?

-   Imagine every user logging in to the same profile or the download button on website not working even after thousands click?
-   With frontend only the website are static and not much of use.
-   Hence, backend is needed. Backend makes the website usable and purposeful also called dynamic( different user different data).

## What is Node.js?

-   Initially, the V8 engine of Chrome efficiently executed JavaScript on the frontend. The V8 engine, written in C++ (assembly-level language), provided this capability.
-   Node.js leverages the same efficiency of the V8 engine to execute JavaScript code on the server-side.
-   Therefore, Node.js is referred to as a runtime environment for JavaScript, offering a platform for running JS code on the server-side.

## NPM (Node Package Manager)

-   Initially, NPM served as a repository akin to a play store for various prebuilt packages of Node.js that could be integrated into our codebase. Hence, it was called Node Package Manager.
-   Over time, packages from other libraries and languages like React and Java were also included. Consequently, NPM no longer has a definite full form.

### Packages

-   Packages are pre-written code files designed to simplify and streamline tasks for developers.They could be included in our own codebase too

## EXPRESS (Package)

-   Express is a npm package also referred to as Node.js framework.
-   It operates on top of Node's HTTP module. It simplifies the creation of web servers and APIs by offering straightforward and minimalistic code for handling HTTP requests. Express provides convenient features for routing, middleware, and error handling, making it easy to develop robust server-side applications.

-   **So can we use node without express? - YES but writing raw HTTP code can be tedious and time-consuming. It's like using other browser like brave and chrome when you have edge itself installed in windows - for the sake of easiness and features**


## Middlewares

- These are functions that handle requests before they reach the main route handlers. They can modify request/response objects or even end the request cycle prematurely. Think of them as checkpoints along the route.
  
## Controllers

- Controllers are where the actual request handling logic resides. They manage incoming requests and produce responses. In simpler terms, they're like the "workers" that perform tasks based on the requests they receive.
  
## Routes

- Routes define the paths (URLs) that your application can handle. They specify which HTTP methods are allowed at each endpoint. So, think of routes as the map that guides requests to their destinations.

#### Dynamic Routing

- Dynamic routing refers to the process of handling different requests based on dynamic parameters in the URL instead of fixed routes. For example, if you observe the URL while watching any YouTube video, you'll notice random letters generated using dynamic routing. No one manually codes each URL. 
- Similarly, dynamic routing is also used in frontend to handle dynamic content and adjust the routing based on user interactions or data changes.


## Express Generator (Package)

- Express Generator is an npm package that simplifies the process of setting up a basic structure for starting backend development. It generates boilerplate code, including directory structure, configuration files, and initial setup, allowing developers to kickstart backend development without manually configuring the environment.


