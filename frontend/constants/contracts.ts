export const CONTRACT_ADDRESSES = {
    mainnet: {
        deployer: 'SP1C5DP9C9N2MB8DMZN18EJNSSA3GYNJE3DGN806V',
        parkingSpot: 'parking-spot',
        booking: 'booking',
        paymentEscrow: 'payment-escrow',
        userRegistry: 'user-registry',
        carRegistry: 'car-registry',
        spotReviews: 'spot-reviews',
        disputeResolution: 'dispute-resolution',
        carinRewardsToken: 'carin-rewards-token',
        rewardsManager: 'rewards-manager',
    },
    testnet: {
        deployer: 'ST3HFR8TCTEQB9WQB25NTHP7MTDAVDJ2NF4YCVG8M',
        parkingSpot: 'parking-spot',
        booking: 'booking',
        paymentEscrow: 'payment-escrow',
        userRegistry: 'user-registry',
        carRegistry: 'car-registry',
        spotReviews: 'spot-reviews',
        disputeResolution: 'dispute-resolution',
        carinRewardsToken: 'carin-rewards-token',
        rewardsManager: 'rewards-manager',
    },
    devnet: {
        deployer: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        parkingSpot: 'parking-spot',
        booking: 'booking',
        paymentEscrow: 'payment-escrow',
        userRegistry: 'user-registry',
        carRegistry: 'car-registry',
        spotReviews: 'spot-reviews',
        disputeResolution: 'dispute-resolution',
        carinRewardsToken: 'carin-rewards-token',
        rewardsManager: 'rewards-manager',
    },
};

export const getContractAddress = (network: 'mainnet' | 'testnet' | 'devnet', contractName: keyof typeof CONTRACT_ADDRESSES.mainnet) => {
    const config = CONTRACT_ADDRESSES[network];
    if (contractName === 'deployer') return config.deployer;
    return `${config.deployer}.${config[contractName]}`;
};

// Helper function to dynamically pull based on NEXT_PUBLIC_NETWORK env
export const currentNetwork = (process.env.NEXT_PUBLIC_NETWORK || 'testnet') as 'mainnet' | 'testnet' | 'devnet';

export const APP_CONTRACTS = {
    parkingSpot: getContractAddress(currentNetwork, 'parkingSpot'),
    booking: getContractAddress(currentNetwork, 'booking'),
    paymentEscrow: getContractAddress(currentNetwork, 'paymentEscrow'),
    userRegistry: getContractAddress(currentNetwork, 'userRegistry'),
    carRegistry: getContractAddress(currentNetwork, 'carRegistry'),
    spotReviews: getContractAddress(currentNetwork, 'spotReviews'),
    disputeResolution: getContractAddress(currentNetwork, 'disputeResolution'),
    carinRewardsToken: getContractAddress(currentNetwork, 'carinRewardsToken'),
    rewardsManager: getContractAddress(currentNetwork, 'rewardsManager'),
};
