import fetch from 'node-fetch';

export default async function handler(req, res) {
    const { method, body, headers, url } = req;

    const path = url.replace('/api/proxy', '');
    const baseUrl = 'http://48.217.160.194:5000';

    try {
        const apiResponse = await fetch(`${baseUrl}${path}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: method === 'GET' ? undefined : JSON.stringify(body),
        });

        const data = await apiResponse.json();
        res.status(apiResponse.status).json(data);
    } catch (error) {
        console.error(error); // Log the error for debugging purposes
        res.status(500).json({ error: 'Internal Server Error', details: error.message }); // Send back more detailed error information
    }
}