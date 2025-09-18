import rabbit from "rabbitmq-stream-js-client";
import type { MessageQueueCache } from "../reciever/index.js";

class RabbitMQStreamSender {

    #streamName: string | null = null;
    #client: any = null;
    #publisher: any = null;

    constructor(streamName: string) {
        this.#streamName = streamName;
    }

    async connect() {
        console.log("Connecting...");
        if (
            !process.env.RABBIT_MESSAGE_QUEUE_VHOST ||
            !process.env.RABBIT_MESSAGE_QUEUE_PORT ||
            !process.env.RABBIT_MESSAGE_QUEUE_HOSTNAME ||
            !process.env.RABBIT_MESSAGE_QUEUE_USERNAME ||
            !process.env.RABBIT_MESSAGE_QUEUE_PASSWORD
        ) {
            throw new Error('RabbitMQ .env vairables not provided');
        }

        // TODO... only connect if client is not already connected
        const client = await rabbit.connect({
            vhost: process.env.RABBIT_MESSAGE_QUEUE_VHOST,
            port:  Number(process.env.RABBIT_MESSAGE_QUEUE_PORT),
            hostname: process.env.RABBIT_MESSAGE_QUEUE_HOSTNAME,
            username: process.env.RABBIT_MESSAGE_QUEUE_USERNAME,
            password: process.env.RABBIT_MESSAGE_QUEUE_PASSWORD,
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


const cache: MessageQueueCache = {
    streamSender: {}
}

const rabbitMQStreamSender = async (streamName?: 'account' | 'reports' | 'fitFarm') => {
    streamName = streamName || 'fitFarm';
    
    if (cache?.streamSender && cache?.streamSender[streamName]) {
        return ({
            sendMessage: cache.streamSender[streamName].sendMessage
        });  
    } else {
        const streamSender = new RabbitMQStreamSender(streamName);

        await streamSender.connect();
        await streamSender.createStream();

        // keep stream sender in the cache
        if (cache?.streamSender) cache.streamSender[streamName] = {
            sendMessage: streamSender.sendMessage
        }

        return ({
            sendMessage: streamSender.sendMessage
        });
    }
}

export default rabbitMQStreamSender;