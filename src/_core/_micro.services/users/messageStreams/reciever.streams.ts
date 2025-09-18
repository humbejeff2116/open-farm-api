import { messageStreamTypes } from "../../../common/types/messageQueue.types.js";
import rabbitMQStreamReciever from "../../../messageQueue/streams/reciever/index.js";


async function recievedStreams() {
    return rabbitMQStreamReciever().then(({recieveMessage}) => {
         recieveMessage((message: any) => {
            switch (message.type) {
                case messageStreamTypes.inviteCodeValidated:
                    break;
                default:
                    console.warn("Unknown message type:", message.type);
            }
        })
    });
}



function start() {
    recievedStreams().then(() => {
        console.log("Account message stream reciever started");
    }).catch((err) => {
        console.error("Failed to start account message stream reciever", err);
    });
}

start();