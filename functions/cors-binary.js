import axios from "axios";
exports.handler = async (event, context) => {
    var url = event.path;
    url = url.split(".netlify/functions/cors-binary/")[1];
    url = decodeURIComponent(url);
    url = new URL(url);

    for (let i in event.queryStringParameters) {
        url.searchParams.append(i, event.queryStringParameters[i]);
    }
    console.log(url.href);
    var cookie_string = event.headers.cookie || "";
    var useragent = event.headers["user-agent"] || "";

    var header_to_send = {
        Cookie: cookie_string,
        "User-Agent": useragent,
        "content-type": "application/json", // Placeholder, replace with appropriate content type
        accept: "*/*",
        host: url.host,
    };

    var options = {
        method: event.httpMethod.toUpperCase(),
        headers: header_to_send,
        data: event.body, // Use data instead of body for POST requests
    };

    if (event.httpMethod.toUpperCase() == "GET" || event.httpMethod.toUpperCase() == "HEAD") delete options.data;

    try {
        const response = await axios(url, options); // Use Axios here
        const response_buffer = await response.data.arrayBuffer(); // Access data as arrayBuffer
        const base64_encoded = Buffer.from(response_buffer).toString("base64");
        const headers = response.headers;

        var cookie_header = null;
        if (headers["set-cookie"]) cookie_header = headers["set-cookie"];

        return {
            statusCode: 200,
            isBase64Encoded: true,
            body: base64_encoded,
            headers: {
                "content-type": headers["content-type"] || "application/octet-stream", // Placeholder, replace with appropriate content type
            },
            multiValueHeaders: {
                "set-cookie": cookie_header || [],
            },
        };
    } catch (error) {
        console.error(error); // Handle errors from Axios request
        return {
            statusCode: 500,
            body: "Error fetching data",
        };
    }
};
