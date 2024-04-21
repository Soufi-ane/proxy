import axios from "axios";

exports.handler = async (event, context) => {
    var url = event.path;
    url = url.split(".netlify/functions/cors/")[1];
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
        "content-type": "application/json",
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
        const response_text = response.data; // Access data from response
        const headers = response.headers;

        var cookie_header = null;
        if (headers["set-cookie"]) cookie_header = headers["set-cookie"];

        return {
            statusCode: 200,
            body: response_text,
            headers: {
                "content-type": headers["content-type"] || "text/plain",
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
