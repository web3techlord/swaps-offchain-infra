import { NETWORK } from "../constants/networks";
import { KnownToken, LabelledToken } from "../types/tokens";

export const networkTokens: Record<string, LabelledToken[]> = {
    [NETWORK.XODEX]: [
        {
            address: "0x1dE8c2E9F71499065c5513EAcb49aF0E2c83d7d5",
            knownToken: KnownToken.ETH,
        },
        // {
        //     address: "0xaEA5741edef497fc7DDb90f32C2FAb6d3237a3fC",
        //     knownToken: KnownToken.BTC,
        // },
    ],
};

// map of known network tokens
export const KnownTokenMap: Record<NETWORK, Record<string, KnownToken>> = Object.keys(networkTokens).reduce(
    (o, k) => ({
        ...o,
        [k]: networkTokens[k].reduce(
            (tokens, labelledToken) => ({
                ...tokens,
                [labelledToken.address]: labelledToken.knownToken,
            }),
            {}
        ),
    }),
    {} as Record<NETWORK, Record<string, KnownToken>>
);
