import rabbit from "rabbitmq-stream-js-client";

export default class RabbitMQStreamSender {

    #streamName: string | null = null;
    #client: any = null;
    #publisher: any = null;

    constructor(streamName: string) {
        this.#streamName = streamName;
    }

    async connect() {
        console.log("Connecting...");
        const client = await rabbit.connect({
            vhost: "/",
            port: 5552,
            hostname: "localhost",
            username: "guest",
            password: "guest",
        });

        this.#client = client;
        // return this;
    }

    async createStream(args?: any) {
        console.log("Making sure the stream exists...");
        const streamSizeRetention = 5 * 1e9
        await this.#client.createStream({ stream: this.#streamName, arguments: args || { "max-length-bytes": streamSizeRetention } });
        this.#declarePublisher();
        // return this
    }

    async #declarePublisher() {
        console.log("Creating the publisher...");
        const publisher = await this.#client.declarePublisher({ stream: this.#streamName });
        this.#publisher = publisher
    }

    async sendMessage(message: any) {
        console.log("Sending a message...");
        await this.#publisher.send(Buffer.from(message));

        console.log("Closing the connection...");
        await this.#client.close();
    }
}