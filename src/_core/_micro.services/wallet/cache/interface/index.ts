import { cacheInterfaceHelpers } from "../../../../cache/lib/index.js";

const WALLETS = "wallets";
const walletsCacheInterface = {
    async getWallets() {
        return await cacheInterfaceHelpers.get(WALLETS, null);
    },
    async getUserWallet(key) {
        return await cacheInterfaceHelpers.get(WALLETS, key);
    },
    async getWallet(key) {
        return await cacheInterfaceHelpers.get(WALLETS, key);
    },
    async setWallets(referrals, expireAfter?: number) {
        return await cacheInterfaceHelpers.put(WALLETS, null, referrals, expireAfter);
    },
    async setUserWallet(key, referral, expireAfter?: number) {
        return await cacheInterfaceHelpers.put(WALLETS, key, referral, expireAfter);
    },
    async setWallet(key, referral, expireAfter?: number) {
        return await cacheInterfaceHelpers.put(WALLETS, key, referral, expireAfter);
    },
    async removeWallets() {
        return await cacheInterfaceHelpers.remove(WALLETS, null);
    },
    async removeUserWallet(key) {
        return await cacheInterfaceHelpers.remove(WALLETS, key);
    },
    async removeWallet(key) {
        return await cacheInterfaceHelpers.remove(WALLETS, key);
    }
}

export default walletsCacheInterface;