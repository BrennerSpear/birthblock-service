import { useEffect, useState, useRef } from 'react';
import { useWeb3React, Web3ReactProvider } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { Web3Provider, getDefaultProvider } from '@ethersproject/providers';
// import useLocalStorage from '../hooks/useLocalStorage';
import { MetamaskIcon, WalletConnectIcon } from '../components/icons';
import { Layout } from '../components/Layout';
import Birthblock from '../birthblock.json';
import { CONTRACT_ADDRESS, NETWORK } from '../utils/constants';
const FREE_MINTS = 144;
import { parseEther } from '@ethersproject/units';
import { Contract } from 'ethers';

const debug = (varObj) => {
    const str = Object.keys(varObj)[0];
    console.log(`${str}: ${varObj[str]}`);
};

const injected = new InjectedConnector({ supportedChainIds: [1, 3, 4, 5, 42] });
const wcConnector = new WalletConnectConnector({
    infuraId: '517bf3874a6848e58f99fa38ccf9fce4',
});

const ConnectorNames = {
    Injected: 'injected',
    WalletConnect: 'walletconnect',
};

const W3Operations = {
    Connect: 'connect',
    Disconnect: 'disconnect',
};

function getLibrary(provider) {
    const library = new Web3Provider(provider);
    console.log('getLibrary');
    debug({ library });
    // library.pollingInterval = 12000;
    return library;
}

export default function HomeWrapper() {
    return (
        <Web3ReactProvider getLibrary={getLibrary}>
            <Home />
        </Web3ReactProvider>
    );
}

function Home() {
    const web3React = useWeb3React();
    debug({ web3React });
    const { active, activate, error, library } = web3React;
    const provider = getDefaultProvider(NETWORK);
    // console.log('eth:', window.ethereum);
    const birthblockContract = new Contract(CONTRACT_ADDRESS, Birthblock.abi, provider);

    const [loaded, setLoaded] = useState(false);

    const [latestOp, setLatestOp] = useState('latest_op');
    const [latestConnector, setLatestConnector] = useState('latest_connector');
    let [hasMinted, setHasMinted] = useState(true);
    let [minted, setMinted] = useState(false);
    let [minting, setMinting] = useState(false);
    let [freeMintsLeft, setFreeMintsLeft] = useState('?');
    // console.log(web3React);

    useEffect(() => {
        console.log('getMintedCount effect start');
        const getMintedCount = async () => {
            const data = await birthblockContract.MintedCount();
            console.log('getMintedCount async finish');
            console.log(data?.toNumber());
            setFreeMintsLeft(FREE_MINTS - data.toNumber());
        };

        getMintedCount();
        console.log('getMintedCount effect end');
    }, []);

    useEffect(() => {
        console.log('latestConnector');
        if (latestOp == 'connect' && latestConnector == 'injected') {
            injected
                .isAuthorized()
                .then((isAuthorized) => {
                    setLoaded(true);
                    if (isAuthorized && !web3React.active && !web3React.error) {
                        web3React.activate(injected);
                    }
                })
                .catch(() => {
                    setLoaded(true);
                });
        } else if (latestOp == 'connect' && latestConnector == 'walletconnect') {
            web3React.activate(wcConnector);
        }
    }, []);

    const getTruncatedAddress = (address) => {
        if (address && address.startsWith('0x')) {
            return address.substr(0, 4) + '...' + address.substr(address.length - 4);
        }
        return address;
    };

    const getNetwork = (chainId) => {
        switch (chainId) {
            case 1:
                return 'Mainnet';
            case 3:
                return 'Ropsten';
            case 4:
                return 'Rinkeby';
            case 5:
                return 'Goerli';
            case 42:
                return 'Kovan';
            default:
                return `unknown network ${chainId}`;
        }
    };

    const claimToken = async () => {
        setMinting(true);
        console.log('contract address:', CONTRACT_ADDRESS);
        const birthblockContract = new Contract(
            CONTRACT_ADDRESS,
            Birthblock.abi,
            library.getSigner(),
        );
        try {
            const data = await birthblockContract.mint({
                value: parseEther('0.01'),
            });
            console.log(data);
            const moreData = await data.wait();
            console.log(moreData);
        } catch (error) {
            // console.log(error);
            console.log(error.error.message);
        }
        setMinting(false);
        setMinted(true);
    };

    const claimText = () => {
        if (!minting && !minted) {
            return 'Claim';
        } else if (minting) {
            return 'Claiming...';
        } else if (minted) {
            return 'Claimed';
        } else {
            return 'wtf';
        }
    };

    const mintsLeftText = () => {
        return `${freeMintsLeft}/144 Free Mints Left`;
    };

    return (
        <Layout>
            <div className="container">
                <div className="connect-wallet-container">
                    <div className="connect-wallet-card">
                        <div className="wallet-header">{mintsLeftText()}</div>
                    </div>
                </div>
                <br />
                {!web3React.active ? (
                    <div className="connect-wallet-container">
                        <div className="connect-wallet-card">
                            <div className="wallet-header">Connect your wallet</div>
                            <div
                                className="button metamask"
                                onClick={() => {
                                    setLatestConnector(ConnectorNames.Injected);
                                    setLatestOp(W3Operations.Connect);
                                    web3React.activate(injected);
                                }}>
                                Metamask
                                <MetamaskIcon />
                            </div>
                            <div
                                className="button walletconnect"
                                onClick={() => {
                                    setLatestConnector(ConnectorNames.WalletConnect);
                                    setLatestOp(W3Operations.Connect);
                                    web3React.activate(wcConnector);
                                }}>
                                WalletConnect
                                <WalletConnectIcon />
                            </div>
                        </div>
                    </div>
                ) : null}

                {web3React.active ? (
                    <>
                        <div className="connected-container">
                            <div className="connected-card">
                                <div className="row mint-section">
                                    <div className="button" onClick={claimToken}>
                                        {claimText()}
                                    </div>
                                </div>
                                <hr className="divider" />
                                <div className="row network-section">
                                    <div className="row-title">Network</div>
                                    <div className="row-subtitle">
                                        {getNetwork(web3React.chainId)}
                                    </div>
                                </div>
                                <hr className="divider" />
                                <div className="row network-section">
                                    <div className="row-title">Address</div>
                                    <div className="row-subtitle">
                                        {getTruncatedAddress(web3React.account)}
                                    </div>
                                </div>
                                <hr className="divider" />
                                <div
                                    className="row disconnect-button"
                                    onClick={() => {
                                        setLatestOp(W3Operations.Disconnect);
                                        web3React.deactivate();
                                    }}>
                                    Disconnect
                                </div>
                            </div>
                        </div>
                    </>
                ) : null}

                <div className="github">
                    <a
                        href="https://github.com/shivkanthb/web3-starter"
                        target="_blank"
                        rel="noreferrer">
                        Github{' '}
                    </a>
                </div>

                <style jsx>{`
          .container {
            min-height: 100vh;
            /* padding: 0 0.5rem; */
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            /* height: 100vh; */
            background-color: #fafafa;
          }
          .connect-wallet-container {
            display: flex;
            width: 400px;
            height: 300px;
            border-radius: 30px;
            background: #ffffff;
            justify-content: center;
            align-items: center;
            text-align: center;
            box-shadow: rgb(0 0 0 / 10%) 0px 4px 20px;
          }
          .wallet-header {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 30px;
          }
          .button {
            width: 300px;
            height: 60px;
            background: #ffffff;
            box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 25px;
            margin: 20px auto;
          }
          .button:hover {
            cursor: pointer;
          }

          .connected-container {
            display: flex;
            /* margin: 20px auto; */
            width: 400px;
            border-radius: 30px;
            background: #ffffff;
            box-shadow: rgb(0 0 0 / 10%) 0px 4px 20px;
          }

          .row {
            display: flex;
            flex-direction: column;
            height: 80px;
            width: 400px;
            justify-content: center;
            padding: 0 20px;
          }

          .row-title {
            font-size: 16px;
            color: #afafaf;
            font-weight: 900;
          }
          .row-subtitle {
            font-size: 22px;
            font-weight: 700;
          }
          .disconnect-button {
            align-items: center;
            color: #f96666;
            font-size: 20px;
            font-weight: 900;
          }
          .disconnect-button:hover {
            cursor: pointer;
          }

          .divider {
            height: 0.1px;
            background-color: #e5e5e5;
            border: none;
            margin: unset;
          }

          .github {
            position: fixed;
            bottom: 30px;
          }

          @media screen and (max-width: 400px) {
            .connect-wallet-container {
              width: 80%;    
            }

            .button {
              width: 240px;
            }

            .connected-container, .row  {
              width: 300px;
            }
        `}</style>
            </div>
        </Layout>
    );
}
