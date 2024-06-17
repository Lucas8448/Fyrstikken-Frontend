"use server";

export async function POST(req: Request) {
    console.log("Starting POST request");
    const data = await req.json();
    console.log(`Data received: ${JSON.stringify(data)}`);

    const url = "http://48.217.160.194:5000/access";
    console.log(`Fetching URL: ${url}`);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        const responseData = await response.json();
        console.log(`Received response: ${JSON.stringify(responseData)}`);

        // Return the responseData as a JSON response to the client
        return new Response(JSON.stringify(responseData), {
            status: 200, // HTTP Status Code
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error("Fetch failed:", error);
    }
}