import type { Request, Response, NextFunction } from 'express';
import { z } from "zod";
import { container } from 'tsyringe';
import rabbitMQStreamSender from '../../../messageQueue/streams/sender/index.js';
import { messageStreamTypes } from '../../../common/types/messageQueue.types.js';
import { UserService } from '../services/user.service.js';


// Resolve the singleton instance of InviteService
const userService = container.resolve(UserService);
export class UserController {

    async signUp(req: Request, res: Response, next: NextFunction) {
        try {
            // TODO... get the session id from the request header
            const sessionId = req.sessionID;

            const signupData = z.object({
                fullName: z.string().min(3).max(100),
                email: z.string().email().max(255),
                password: z.string().min(6).max(100),   
                teamName: z.string().max(255).optional().nullable(),
                inviteCode: z.string().max(20).optional().nullable(),
            }).parse(req.body);


            // send a message to validate invite code
            // recieve a message from invite code validating code
            // create account after validation
            //emit account created socket event to client using the clients session id

             if (!signupData) {
                return res.status(200).json({
                    success: true,
                    message: 'signup Data not provided',
                    data: null 
                })
            }

            const createAccount = await userService.createAccount(signupData);

            if (!createAccount.success) {
                return res.status(200).json({
                    success: true,
                    message: createAccount.reason,
                    data: null 
                })
            }

            // send account created message to message stream
            rabbitMQStreamSender()
            .then(({sendMessage}) => {
                sendMessage({
                    type:  messageStreamTypes.accountCreated,
                    message: {
                        userId: createAccount.data.id,
                        inviteCode: createAccount.data.inviteCode,
                    }
                })
            })
           .then(() => {
                console.log('account created message sent to RabbitMQ stream')
            }).catch((err) => {
                console.error('Error sending account created message to RabbitMQ stream', err)
            })

            // Emit an account sign up event here to all connected clients
            // ;(global as any).io?.emit(`account:created`, {
            //     message: 'Account created succesfully',
            //     success: true,
            // })

            return res.status(200).json({
                success: true,
                data: createAccount.data 
            })

        } catch (error) {
            if (error instanceof Error) {
                return res.status(400).send({ message: error.message });
            }
            return res.status(500).send({ message: 'An unexpected error occurred.' });
        }
    } 
    
    userSignupSuccessfull(req: Request, res: Response, next: NextFunction) {
        const { id: userId, inviteCode } = req.params;

        if (!userId) {
            return res.status(403).json({message: 'Un Authorized'});
        }

        try {
            // send account created message to message stream
            rabbitMQStreamSender()
            .then(({sendMessage}) => {
                sendMessage({
                    type:  messageStreamTypes.accountCreated,
                    message: {
                        userId: userId,
                        inviteCode: inviteCode,
                    }
                })
            })
           .then(() => {
                console.log('account created message sent to RabbitMQ stream')
            }).catch((err) => {
                console.error('Error sending account created message to RabbitMQ stream', err)
            })

            // Emit an account sign up event here to all connected clients
            ;(global as any).io?.emit(`account:created`, {
                message: 'Account created succesfully',
                success: true,
            })

            return res.status(200).json({
                success: true,
                data: null 
            })
        } catch (err) {
            next(err);   
        }
    }
}


const userController = new UserController();
export default userController;