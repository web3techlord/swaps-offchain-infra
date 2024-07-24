export type LabelledToken = {
    address: string;
    knownToken: KnownToken;
};

export type PriceFeedToken = LabelledToken & {
    precision: number;
};

export enum KnownToken {
    ETH = "ETH",
    BTC = "BTC",
    // LINK = "LINK",
    // UNI = "UNI",
    // FXS = "FXS",
    // CRV = "CRV",
    // BAL = "BAL",
}

export enum PriceFeedAddress {
    ETH = "0x558cD3fF19d4213CD31A0Bb108cCD6aDCb5DEA8b",
    BTC = "0xA89945a5c12AE02D4a3FdD001ce06F16f272Ccc4",
}
