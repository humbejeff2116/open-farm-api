import rabbit from "rabbitmq-stream-js-client";

class RabbitMQStreamReciever {
    #streamName: string | null = null;
    #client: any = null;

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
    }

    async declareConsumer(consumeMessage: (message: any) => any) {
        console.log("Creating the publisher...");
        await this.#client.declareConsumer({ stream: this.#streamName, offset: rabbit.Offset.first() }, consumeMessage)
    }

    recieveMessage(message: any) {
        console.log(`Received message ${message.content.toString()}`)
    }
}


let streamNameModule: string;
export interface MessageQueueCache {
    streamSender?: {
        [streamNameModule]: {
            sendMessage: (message: any) => Promise<void>
        }
    }
    streamReciever?: {
        [streamNameModule]: {
            recieveMessage: (message: any) => void
        }
    }
}

const cache: MessageQueueCache = {
    streamReciever: {},
}

const rabbitMQStreamReciever = async (streamName?: 'account' | 'reports' | 'fitFarm') => {
    streamName = streamName || 'fitFarm';

    if (cache?.streamReciever && cache?.streamReciever[streamName]) {
        return ({
            recieveMessage: cache.streamReciever[streamName].recieveMessage
        }); 
    } else {
        const rabbitMQStream: RabbitMQStreamReciever = new RabbitMQStreamReciever(streamName);
        await rabbitMQStream.connect();
        await rabbitMQStream.createStream();

        // keep stream sender in the cache
        // streamNameModule = streamName;
        if (cache?.streamReciever) cache.streamReciever[streamName] = {
            recieveMessage: rabbitMQStream.recieveMessage.bind(rabbitMQStream) 
        }

        return ({
            recieveMessage: rabbitMQStream.recieveMessage.bind(rabbitMQStream)
        }); 
    }
}


export default rabbitMQStreamReciever;