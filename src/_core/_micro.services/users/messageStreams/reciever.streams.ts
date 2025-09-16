import RabbitMQStreamReciever from "../../../../messageQueue/streams/reciever/index.js";

export const accountMessageStreamTypes = {
    accountCreated: 'account_created',
    accountUpdated: 'account_updated'
}

interface Cache {
    streamReciever: {
        recieveMessage: (message: any) => void
    } | null

}


const cache: Cache = {
    streamReciever: null
}

const rabbitAccountMQStreamReciever = (async (streamName: string) => {
    if (cache.streamReciever) {
        return ({
            recieveMessage: cache.streamReciever.recieveMessage
        }); 
    } else {
        const rabbitMQStream = new RabbitMQStreamReciever(streamName);
        await rabbitMQStream.connect();
        await rabbitMQStream.createStream();

        // keep stream sender in the cache
        cache.streamReciever = {
            recieveMessage: rabbitMQStream.recieveMessage.bind(rabbitMQStream)
        }

        return ({
            recieveMessage: rabbitMQStream.recieveMessage.bind(rabbitMQStream)
        }); 
    }
})('account');


export class AccountController {


    async updateAccount() {
        (await rabbitAccountMQStreamReciever).recieveMessage(
            {
                type:  accountMessageStreamTypes.accountCreated,
                message: 'hello'
            }
        )
    }
    
}


export default rabbitAccountMQStreamReciever;