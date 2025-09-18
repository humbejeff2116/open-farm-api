import { injectable, inject, container, singleton } from 'tsyringe';
import type { IUserService, UserDTO } from '../../../common/interfaces/user.interface.js';
import type { IInviteService } from '../../../common/interfaces/invite.interface.js';
import { eq, sql, desc, and, SQL } from "drizzle-orm";
import { profiles } from '../../../database/drizzle/migrations/schema/profiles.schema.js';
import { db } from '../../../database/index.database.js';


@singleton()
@injectable()
export class UserService implements IUserService {
    constructor(@inject('IInviteService') private inviteService: IInviteService) {}

    async createAccount(account: any) { 
        console.log(`[User Service] Attempting to sign up user: ${account.email}`);

        // Synchronous request to the invites service via the interface
        const validateInviteCode = await this.inviteService.validateInviteCode(account.inviteCode);

        if (!validateInviteCode) {
            return ({
                success: false,
                reason: 'invalid invite code',
                data: null
            })
        }

        console.log(`[User Service] Invite validated. Creating user: ${account.email}`);

        const signupUser =  await supabase.auth.signUp({
            email: account.email,
            password: account.password,
            options: {
                data: {
                    invite_code: account.inviteCode,
                    full_name: account.fullName,
                    team_name: account?.teamName
                }
            }
        })

        return ({
            success: true,
            reason: 'invalid invite code',
            data: signupUser
        })
    }


    public async getByInviteCode(inviteCode: string): Promise<any> {
        console.log(`[User Service] Finding users for invite code: ${inviteCode}`);
        
        const rows = await db.select()
        .from(profiles)
        .where(eq(profiles.inviteCode, inviteCode))
        .orderBy(desc(profiles.createdAt));

        return rows;
    }

    async getAccounts() {

    }

    async getAccountByEmail(accountEmail: string) {

    }

    async getUserAccount(accountId: string) {
 
    }

    async updateAccountProfileImage(
        accountId: string, 
        profileImage: any
    ) {

    }

    async updateAccountNotificationStatus(
        accountId: string, 
        hasActiveNotification: boolean
    ) {

    }

    async getAccountPurchaseHistory(accountId: string) {
       
    }

    async checkAccountPassword(password: string, account: any) {
        
    }

    async AccountExist(id: string) {
        // return await this.getAccountById(id) ? true : false;
    }
}

// const userService = container.resolve(UserService);
// export default userService;