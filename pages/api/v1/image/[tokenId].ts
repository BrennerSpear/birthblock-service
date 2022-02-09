import type { NextApiRequest, NextApiResponse } from 'next';

import { ioredisClient } from '@utils';
import { CONTRACT_BIRTHBLOCK } from '@utils/constants';
import { Metadata, timestampToDate } from '@utils/frontend';
import generateSVG from '@utils/generateSvg';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { tokenId } = req.query;
    const tokenIdString: string = Array.isArray(tokenId) ? tokenId[0] : tokenId;
    const data = await ioredisClient.hget(tokenIdString.toLowerCase(), 'metadata');

    if (!data) {
        return res.status(404).send({ message: `Image for token id ${tokenId} not found.` });
    }

    const metadata = JSON.parse(data);
    const svgString = generateSVG(metadata);

    const svgBuffer = Buffer.from(svgString, 'utf-8');
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svgBuffer);
}
