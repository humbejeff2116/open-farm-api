import rabbit from "rabbitmq-stream-js-client";

export default class RabbitMQStreamReciever {

    #streamName: string | null = null;
    #client: any = null;

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
    }

    async declareConsumer(consumeMessage: (message: any) => any) {
        console.log("Creating the publisher...");
        await this.#client.declareConsumer({ stream: this.#streamName, offset: rabbit.Offset.first() }, consumeMessage)
    }

    recieveMessage(message: any) {
        console.log(`Received message ${message.content.toString()}`)
    }
}