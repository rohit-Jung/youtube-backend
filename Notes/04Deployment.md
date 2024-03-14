# How are Apps Deployed with Front-end and Back-end?

## Choosing a Deployment Strategy

-   Decide whether to deploy the front-end and back-end together as a single application or separately as microservices.
-   Consider factors such as scalability, maintenance, and performance when choosing the deployment strategy.

## Set up Hosting Environment

-   Choose a hosting provider or platform for deploying the application, such as AWS, Google Cloud Platform, Azure, or Heroku.
-   Set up the necessary infrastructure, including servers, databases, storage, and networking configurations.
-   Deploy the application using GitHub as a codebase.

## Deploying the Back-end

-   Deploy the back-end components of the application, such as server-side code, APIs, databases, and other services.
-   Ensure that the back-end is configured correctly and can handle incoming requests from the front-end.

## Deploying the Front-end

-   Deploy the front-end components of the application, such as HTML, CSS, JavaScript files, and static assets.
-   Configure the front-end to interact with the deployed back-end APIs or services.

## Testing the Deployment

-   Check for errors in the build log of the hosting environment to ensure the seamless running of the application.

# Other Info

## Axios (Package)

-   This is library especially made to make HTTP requests or fetch data. It is like fetch with more advanced and extended features. We do not have to convert the data to JSON which is one of the feature.

```javascript
axios.get("api-url").then((response) => {
    setData(response.data);
});
```

## What is CORS policy?

-   Cross-Origin Resource Sharing is basically the policy that determines who is allowed to access the request to the server. URL and Port different ??
-   CORS npm package also exits which enables us to whitelist specific IP, Domain and Port

## What is Proxy ?

-   The urls like `http://localhost:400` get changed after being deployed. Hence we need to add a proxy to the request. It is an object that will append before the key given to it.
    Different bundler have different proxy settings/config options which needs to be configured accordingly.

VITE config file changes for proxy.

```javascript
proxy: {
    '/api': 'http://localhost:3000'
}
```

-   This proxy will solve the CORS policy issue if the backend is also being served at `http://localhost:3000` as the app assumes the request is coming from the origin (original backend) itself.

# App deployment bad practices

-   "In react/frontend Folder" -> npm run build
    -   build a dist folder containing all the static assets which are than later moved to backend folder and then served as middleware
    -   This is considered a bad practice because if we want to do any update in frontend we should again delete the dist folder and then move from updated dist frontend folder to backend.
