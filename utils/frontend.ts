export function getTruncatedAddress(address: string): string {
    if (address && address.startsWith('0x')) {
        return address.substr(0, 4) + '...' + address.substr(address.length - 4);
    }
    return address;
}

export const timestampToDate = (ts: number): Record<string, number> => {
    const date = new Date(ts * 1000);
    const dateObj = {
        year: date.getFullYear(),
        month: date.getMonth(),
        day: date.getDate(),
        hour: date.getHours(),
        minute: date.getMinutes(),
        second: date.getSeconds(),
    };

    return dateObj;
};

export type Metadata = {
    name: string;
    description: string;
    image: string; // birthblock.art/api/v1/image/[tokenId]
    external_url: string; // birthblock.art/birthblock/[tokenId]
    address: string;
    parent: string;
    firstRecieved: 'ether' | 'token(s)';
    treeRings: string;
    timestamp: number;
    // birthTime?: string;
    // date?: number;
    birthblock: string;
    txnHash: string;
    zodiacSign: string;
    blockAge: number;
    treeRingsLevel: number;
};

export function debug(varObj: object): void {
    Object.keys(varObj).forEach((str) => {
        console.log(`${str}:`, varObj[str]);
    });
}

export const event = (action: string, params?: Object) => {
    window.gtag('event', action, params);
};

export type EventParams = {
    network?: string;
    buttonLocation?: string;
    connectionType?: string;
    connectionName?: string;
    errorReason?: string;
    errorMessage?: string;
};
