// export enum Roles {
//     ADMIN = 'admin',
//     VENDOR = 'vendor',
//     BUYER = 'buyer',
//     GUEST = 'guest',
//     ANONYMOUS = 'anonymous',
//     FARMER = 'farmer',
//     AGENT = 'agent',
//     SUPERVISOR = 'supervisor'
// }

import type { User } from "@supabase/supabase-js";

export type UserRole = "farmer" | "agent" | "supervisor" | "admin" | "guest";


export enum UserPermissions {
    CREATE_RECORD = 'create_record',
    READ_RECORD = 'read_record',
    UPDATE_RECORD = 'update_record',
    DELETE_RECORD = 'delete_record',
}

export interface Role {
    name: UserRole
    permissions: Array<UserPermissions>
}
const admin: UserRole = "admin";
const guest: UserRole = "guest";
// const vendor: UserRole = "vendor";
// const buyer: UserRole = "buyer";
// const anonymous: UserRole = "anonymous";
// const farmer: UserRole = "farmer";
// const agent: UserRole = "agent";
// const supervisor: UserRole = "supervisor";
export const userRoles: Array<Role> = [
    {
        name: admin,
        permissions: [
            UserPermissions.CREATE_RECORD,
            UserPermissions.READ_RECORD,
            UserPermissions.UPDATE_RECORD,
            UserPermissions.DELETE_RECORD
        ]
    },
    // {
    //     "name": "vendor",
    //     "UserPermissions": [
    //         UserPermissions.CREATE_RECORD,
    //         UserPermissions.READ_RECORD,
    //         UserPermissions.UPDATE_RECORD,
    //         UserPermissions.DELETE_RECORD
    //     ]
    // },
    // {
    //     "name": Roles.BUYER,
    //     "UserPermissions": [
    //         UserPermissions.CREATE_RECORD,
    //         UserPermissions.READ_RECORD,
    //         UserPermissions.UPDATE_RECORD,
    //     ]
    // },
    {
        name: guest,
        permissions: [
            UserPermissions.READ_RECORD,
        ]
    }
]

class UserPermission {
    // private permissions;
    private roles: Array<Role>;

    constructor() {
        // this.roles = userRoles as Array<RoleWithUserRoleName>;
        this.roles = userRoles;
        // super();
        // this.permissions = [];
        // this.roles = userRoles;
    }
    
    public getPermissionsByRoleName(roleName: UserRole): Array<UserPermissions>  {
        const role = this.roles.find(role => role.name === name as any);
        return role ? role.permissions : [];
    }

    public getRoleByName(name: UserRole): Role | undefined {
        return this.roles.find(role => role.name === name as any);
    }
}

export const userPermission = new UserPermission();
