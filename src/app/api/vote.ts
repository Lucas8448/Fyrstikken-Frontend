export function GET(req: Request) {
    const data = req.json()
    const response = fetch("http://48.217.160.194:5000/vot",
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
    return response
}