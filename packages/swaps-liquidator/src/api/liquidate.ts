import { ethers } from "ethers";
import colors from "colors";
import { Vault__factory, PositionManager__factory } from "gmx-contracts";
import getOpenPositions from "../helpers/getOpenPositions";
import getPositionsToLiquidate from "../helpers/getPositionsToLiquidate";
import { checkProviderHealth } from "../utils";
import { ethBalance, liquidationErrors } from "../utils/prometheus";
import { liquidateOneByOne } from "../helpers/liquidatePositions";

const liquidationHandler = async function () {
    try {
        const urlInfo = {
            url: process.env.RPC_URL,
            user: "e0z73k6cm9",
            password: "lOq87tL5Uh-RQM9Nx5IcV2GgcJshy7O8aXFYvyqwN5w",
        };

        let provider = new ethers.providers.JsonRpcProvider(urlInfo);
        const isProviderHealthy = await checkProviderHealth(provider);
        if (!isProviderHealthy) {
            console.log(colors.red("Main provider is not healthy. Switching to fallback provider."));
            provider = new ethers.providers.JsonRpcProvider(process.env.FALLBACK_RPC_URL);
        }

        const signer = new ethers.Wallet(`0x${process.env.LIQUIDATOR_PRIVATE_KEY}`, provider);
        const vault = Vault__factory.connect(process.env.VAULT_ADDRESS, signer);
        const positionManager = PositionManager__factory.connect(process.env.POSITION_MANAGER_ADDRESS, signer);

        // Update ETH balance metric
        const balanceWei = await signer.getBalance();
        const balanceEth = ethers.utils.formatEther(balanceWei);
        ethBalance.set(parseFloat(balanceEth));

        console.log("STEP 1: Get open positions");

        const openPositions = await getOpenPositions(vault, provider);

        console.info("openPositions.length: " + openPositions.length);

        if (openPositions.length === 0) {
            console.info("OK, nothing liquidated.");
            return;
        }

        console.log("STEP 2: Get positions to liquidate");
        const positionsToLiquidate = await getPositionsToLiquidate(vault, positionManager, openPositions);

        console.log("positionsToLiquidate.length: " + positionsToLiquidate.length);

        console.log("STEP 3: Check liquidations");
        if (positionsToLiquidate.length === 0) {
            console.info("OK, nothing liquidated.");
            return;
        }

        console.log("STEP 4: Liquidate positions");
        await liquidateOneByOne(positionsToLiquidate, positionManager);
        console.log("OK, all positions liquidated.");

        return;
    } catch (error) {
        liquidationErrors.inc({ error: error.message });
        console.log("Error occured in liquidate.ts:handler");
        console.log(error);
    }
};

let isProcessing = false;
export default async () => {
    if (isProcessing) {
        console.info("Liquidation is already processing.");
        return;
    }
    isProcessing = true;
    await liquidationHandler();
    isProcessing = false;
};
