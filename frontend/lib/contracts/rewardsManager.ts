/**
 * Typed surface for the `rewards-manager` Clarity contract.
 */

import {
    fetchCallReadOnlyFunction,
    uintCV,
    standardPrincipalCV,
    cvToValue,
    type ClarityValue,
} from "@stacks/transactions";

import { getStacksNetwork, getContractRef, getDeployerAddress } from "./network";

const REF = () => getContractRef("rewardsManager");

export async function getPendingRewards(
    address: string,
    senderAddress?: string,
): Promise<bigint> {
    const result = await fetchCallReadOnlyFunction({
        ...REF(),
        functionName: "get-pending-rewards",
        functionArgs: [standardPrincipalCV(address)],
        network: getStacksNetwork(),
        senderAddress: senderAddress ?? getDeployerAddress(),
    });
    // Returns a bare uint (not optional, not response).
    return BigInt(cvToValue(result as ClarityValue) as bigint | number);
}

export function buildAddRewardCall(args: {
    userAddress: string;
    amount: bigint | number | string;
}) {
    return {
        ...REF(),
        functionName: "add-reward",
        functionArgs: [
            standardPrincipalCV(args.userAddress),
            uintCV(BigInt(args.amount)),
        ],
        network: getStacksNetwork(),
    };
}

export function buildClaimRewardsCall() {
    return {
        ...REF(),
        functionName: "claim-rewards",
        functionArgs: [],
        network: getStacksNetwork(),
    };
    // NOTE: as of the current deployment, claim-rewards reverts for
    // anyone except the deployer because of an auth check in the
    // underlying carin-rewards-token.mint. See PR 3's
    // tests/rewards-manager.test.ts BUG: test for details. The build
    // helper above stays useful for the eventual fix.
}
