import  RabbitMQStreamSender  from "../../../../messageQueue/streams/sender/index.js";

interface Cache {
    streamSender: {
        sendMessage: (message: any) => Promise<void>
    } | null
}

const cache: Cache = {
    streamSender: null
}

export const accountMessageStreamTypes = {
    accountCreated: 'account_created',
    accountUpdated: 'account_updated'
}

const rabbitMQStreamSender = (async (streamName: string) => {
    if (cache.streamSender) {
        return ({
            sendMessage: cache.streamSender.sendMessage
        }); 
    } else {
        const streamSender = new RabbitMQStreamSender(streamName);
        await streamSender.connect();
        await streamSender.createStream();

        // keep stream sender in the cache
        cache.streamSender = {
            sendMessage: streamSender.sendMessage
        }

        return ({
            sendMessage: streamSender.sendMessage
        });
    }
})('account');


// usage in controller
export class AccountController {

    async updateAccount() {

        (await rabbitMQStreamSender).sendMessage({
            type:  accountMessageStreamTypes.accountCreated,
            message: 'hello'
        })
    }
    
}


export default rabbitMQStreamSender;