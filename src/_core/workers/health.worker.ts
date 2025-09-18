import http from "http";

export function startHealthServer(port = process.env.HEALTH_SERVER_PORT || 4001) {
    const server = http.createServer((req, res) => {
        if (req.url === "/health") {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ status: "ok" }));
        } else {
            res.writeHead(404);
            res.end();
        }
    });
    server.listen(port, () => console.log(`Health server running on :${port}`));
}