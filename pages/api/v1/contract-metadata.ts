import type { NextApiRequest, NextApiResponse } from 'next';

import { WEBSITE_URL } from '@utils/constants';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const metadata = {
        name: 'Birthblock',
        description:
            "Birthblocks are art and attributes based on the birthblock of the minter's wallet address. <br><br> Part of **The Metagame**. Follow along on twitter [@The_Metagame](https://twitter.com/the_metagame). Mint one at [birthblock.art](https://www.birthblock.art) ",
        image: `https://${WEBSITE_URL}/logo.png`,
        external_link: `https://${WEBSITE_URL}`,
        seller_fee_basis_points: 800, // 8%,
        fee_recipient: '0x902A37155438982884ca26A5DBccf73f5ae8194b',
    };

    res.send(metadata);
}
