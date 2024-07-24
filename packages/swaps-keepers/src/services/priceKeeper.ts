import { logger } from "ethers";
import { TypedEmitter } from "tiny-typed-emitter";
import { ParsedTokenPrice } from "@mycelium-ethereum/swaps-js";
import { FastPriceFeed } from "gmx-contracts";
import PriceFeed, { UpdateResult, UpdateResultPrimary } from "./priceFeed";

interface PriceKeeperEvents {
    executed: (e: UpdateResult | UpdateResultPrimary) => void;
    force_update: ({ lastUpdatedAt, now }: { lastUpdatedAt: number; now: number }) => void;
}

export default class PriceKeeper extends TypedEmitter<PriceKeeperEvents> {
    isUpdating = false;

    async updatePrices(
        priceFeed: PriceFeed,
        fastFeedContract: FastPriceFeed,
        medianPrices: ParsedTokenPrice[]
    ): Promise<void> {
        this.isUpdating = true;
        const result = await priceFeed.updatePricesWithBits(fastFeedContract, medianPrices);

        console.log("result11", result);

        if (result) {
            this.emit("executed", result);
        }

        console.log("medianPrices", medianPrices);

        const result2 = await priceFeed.updatePricesPrimary(medianPrices);

        console.log("prices", medianPrices);

        console.log("result222", result2);

        if (result2) {
            console.log("executed222", result2);

            // this.emit("executed", result2);
        }
        this.isUpdating = false;
    }

    async checkStalePrices(priceFeed: PriceFeed, fastFeedContract: FastPriceFeed, forceUpdateInterval: number) {
        const lastUpdatedAt = (await priceFeed.updateLastUpdatedAt(fastFeedContract)) ?? 0;
        const now = Math.floor(Date.now() / 1000);
        const priceAge = now - lastUpdatedAt;
        logger.info(`Prices are ${priceAge}s old, last updated at ${lastUpdatedAt}`);
        if (lastUpdatedAt !== 0 && priceAge > forceUpdateInterval) {
            this.emit("force_update", { lastUpdatedAt, now });
        }
    }
}
