import { Types } from "mongoose";

type ObjectIdOrString = Types.ObjectId | string;
// TODO... remove duplicate in rbac/data/roles.ts file
export enum Roles {
    ADMIN = 'admin',
    BUYER = 'supervisor',
    VENDOR = 'vendor',
    GUEST = 'guest',
    ANONYMOUS = 'anonymous'
}

// account
export interface Account {
    _id?: Types.ObjectId,
    fullName: string,
    email: string,
    userName: string,
    password: string,
    contactNumber?: string,
    profileImage?: string,
    role: "farmer" | "agent" | "supervisor" | "admin",
    inviteCode?: string, // optional invite code used for signup
    teamName?: string, // optional team name for agents
    isEmailVerified?: boolean,
    isPhoneVerified?: boolean,
    isTwoFactorEnabled?: boolean,
    twoFactorSecret?: string, // secret for 2FA
    twoFactorRecoveryCodes?: string[], // recovery codes for 2FA
    lastLogin?: Date, // last login timestamp
    lastPasswordChange?: Date, // last password change timestamp
    lastTwoFactorChange?: Date, // last 2FA change timestamp
    lastEmailChange?: Date, // last email change timestamp
    lastPhoneChange?: Date, // last phone number change timestamp
    lastLoginIp?: string, // last login IP address
    lastLoginLocation?: string, // last login location
    lastLoginDevice?: string, // last login device information
    isActive?: boolean, // account active status
    isLocked?: boolean, // account lock status
    lockReason?: string, // reason for account lock
    lockUntil?: Date, // date until account is locked
    invalidLoginAttempts?: number, // number of invalid login attempts
    passwordResetReq?: number, // number of password reset requests
    lockResetPassword?: Date, // date until password reset is locked
    purchaseHistory?: Purchase[], // purchase history for the account
    hasActiveNotification?: boolean, // flag to indicate if there are active notifications
    createdAt?: Date, // account creation timestamp     
    updatedAt?: Date, // account last update timestamp
    // active: boolean,
}


interface Purchase {
    itemId: ObjectIdOrString 
    timestamp: Date, 
}