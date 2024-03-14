# Introduction to Essentials

## Internet

-   Connection of multiple systems worldwide for sharing data.

## ISP (Internet Service Provider)

-   A company that offers internet services.
-   Process:
    -   Device sends a request.
    -   Signal transmitted to a tower.
    -   ISP analyzes the request.
    -   Request forwarded to the required server.
    -   Response received from server
    -   forwarded to respective user/client.

## Router

-   A device that receives requests (data-packets) and sends them to towers.
-   Upon receiving responses, it routes them back to the respective devices.

## IP and MAC addresses (Internet Service & Media Access Control)

### MAC Address

-   A hardcoded unique hexadecimal number assigned to each device using a network.
-   Assigned by the manufacturer.
-   Used for addressing devices in the `data-link`layer of the `OSI Model`.

### IP Address

-   An address assigned to a device over a network.
-   May not be unique to every device.
-   Used for addressing devices in the `network` layer of the `OSI Model`.

## Server

-   Any device capable of receiving requests and sending responses accordingly.
-   Server processing is often resource-intensive.
-   Many servers are CPU-only devices as they handle data exchange exclusively.
-   The basic client-server architecture involves clients sending requests and servers responding to them.

## HTTP

-   Hyper-text Transfer Protocol
-   It is the protocol (set of rules) used to transfer data over the internet.
-   Various ISPs across the world help maintain it.

### HTTP Vs HTTPS

-   The basic difference is that transferring data with HTTPS (Secured) involves encrypting the data in the middle of sending and receiving it. This way, no middleman can read or modify the data packets.

### HTTP Headers

-   They are the metadata (key-value pairs) sent along with the request and response.
-   Used in caching, authentication, managing states, etc.

### Types of Headers

-   **Request Headers**: Sent from the client.
-   **Response Headers**: Sent from the server.
-   **Representation Headers**: Encoding, compressions, etc.
-   **Payload Headers**: Information about data.
-   And many more.

### Most-Common Headers

-   **Accept: application/json**: To accept JSON data.
-   **User-Agent**: Provides information about the user's device.
-   **Authorization**: Used for Bearer Tokens.
-   **Content-Type**: Indicates the type of content, such as PDF, video, file, etc.

#### CORS (Cross-Origin Resource Sharing)

-   **Access-Control-Allow-Origin**
-   **Access-Control-Allow-Credentials**
-   **Access-Control-Allow-Methods**

#### Security

-   **Cross-Origin-Embedder-Policy**
-   **Content-Security-Policy**

### HTTP Methods

-   A set of operations used with internet servers.
-   Most used: GET, POST, PUT, PATCH, HEAD, OPTIONS, TRACE.

    -   **GET**: For retrieving information.

    -   **POST**: For interacting with resources.

    -   **PUT**: Replaces the whole resource.

    -   **PATCH**: Replaces a part of the resource.

    -   **HEAD**: No body (response headers only).

    -   **OPTIONS**: Available options.

    -   **TRACE**: Loops back test (gets some data).

## Status Code

-   **1XX**: Informational.
-   **2XX**: Success.
-   **3XX**: Redirection.
-   **4XX**: Client Error.
-   **5XX**: Server Error.
