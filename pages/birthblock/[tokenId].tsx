import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Box, Button } from '@chakra-ui/react';
import { InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import Image from 'next/image';

import { ioredisClient } from '@utils';
import { CONTRACT_ADDRESS } from '@utils/constants';
import { Metadata } from '@utils/frontend';
import generateSVG from '@utils/generateSvg';

export const getServerSideProps = async (context) => {
    const { tokenId } = context.query;
    const metadata = await ioredisClient.hget(tokenId, 'metadata');
    return {
        props: {
            metadata,
            tokenId,
        },
    };
};

function BirthblockPage({
    tokenId,
    metadata: metadataStr,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const getOpenSeaUrl = (tokenId: string) => {
        return `https://opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId}`;
    };

    const metadata: Metadata = JSON.parse(metadataStr);
    const size = ['80vw'];
    console.log(metadata);
    const svgString = generateSVG(metadata);
    const buff = Buffer.from(svgString);
    console.log(svgString);
    const base64data = buff.toString('base64');

    return (
        <Box align="center" p="16px" minH="calc(100vh - 146px)" w="auto">
            <Head>
                <title>{metadata.name}</title>
                <meta property="og:title" content={metadata.name} />
                <meta property="og:description" content={metadata.description} />
            </Head>
            <Box w={size} h={size} maxW="800px" maxH="800px">
                <Image
                    src={`data:image/svg+xml;base64,${base64data}`}
                    alt="birthblock image"
                    height="800px"
                    width="800px"
                />
            </Box>
            <Box>
                <Button
                    colorScheme="teal"
                    my={4}
                    size="lg"
                    boxShadow="lg"
                    fontSize="2xl"
                    bg="teal.700"
                    rightIcon={<ExternalLinkIcon />}
                    onClick={() => window.open(getOpenSeaUrl(tokenId))}>
                    View on OpenSea
                </Button>
            </Box>
        </Box>
    );

    //     return (
    //         <Box align="center" p="16px" minH="calc(100vh - 146px)">
    //             <SimpleGrid minChildWidth={[200, 400, 400, 400]} spacing={4}>
    //                 <AspectRatio ratio={1}>
    //                     <Box h="100vh" w="100vw">
    //                         <Heart
    //                             address={metadata.address}
    //                             attributes={getParametersFromTxnCounts(metadata.txnCounts)}
    //                             // onSaveGif={onSaveGif}
    //                             // record={true}
    //                         />
    //                     </Box>
    //                 </AspectRatio>
    //                 <AspectRatio ratio={1}>
    //                     <Box id="not-heart">{/* <Box>{attributes(metadata)}</Box> */}</Box>
    //                 </AspectRatio>
    //             </SimpleGrid>
    //         </Box>
    //     );
}

export default BirthblockPage;
