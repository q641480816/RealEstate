import Web3 from 'web3';
import orderBookContractJson from './abi/SellOrderBook.json';
import propertyAContractJson from './abi/PROPERTYA.json';
import propertyBContractJson from './abi/PROPERTYB.json';
import propertyCContractJson from './abi/PROPERTYC.json';
import propertyDContractJson from './abi/PROPERTYD.json';
import sgdContractJson from './abi/SUPERSGD.json';

const SmartContactController = () => {

    const web3 = new Web3(new Web3.providers.HttpProvider('HTTP://127.0.0.1:7545'));

    const orderBookContract = new web3.eth.Contract(orderBookContractJson.abi, orderBookContractJson.address)
    const propertyAContract = new web3.eth.Contract(propertyAContractJson.abi, propertyAContractJson.address)
    const propertyBContract = new web3.eth.Contract(propertyBContractJson.abi, propertyBContractJson.address)
    const propertyCContract = new web3.eth.Contract(propertyCContractJson.abi, propertyCContractJson.address)
    const propertyDContract = new web3.eth.Contract(propertyDContractJson.abi, propertyDContractJson.address)
    const sgdContract = new web3.eth.Contract(sgdContractJson.abi, sgdContractJson.address)

    const tokenList = [propertyAContract, propertyBContract, propertyCContract, propertyDContract];
    // console.log(propertyAContract.methods)

    return {
        getTokensInfo: () => {
            return new Promise((resolve, reject) => {

                const getTokenInfo = (tokenContract) => {
                    return new Promise((resolve, reject) => {
                        const batch = new web3.BatchRequest();
                        const namePromise = new Promise((resolve, reject) => {
                            batch.add(tokenContract.methods.name().call.request({}, 'latest', (error, result) => {
                                if (error) reject(error);
                                else resolve(result);
                            }));
                        });

                        const symbolPromise = new Promise((resolve, reject) => {
                            batch.add(tokenContract.methods.symbol().call.request({}, 'latest', (error, result) => {
                                if (error) reject(error);
                                else resolve(result);
                            }));
                        });

                        const totalSupplyPromise = new Promise((resolve, reject) => {
                            batch.add(tokenContract.methods.totalSupply().call.request({}, 'latest', (error, result) => {
                                if (error) reject(error);
                                else resolve(result);
                            }));
                        });

                        const decimalPromise = new Promise((resolve, reject) => {
                            batch.add(tokenContract.methods.decimals().call.request({}, 'latest', (error, result) => {
                                if (error) reject(error);
                                else resolve(result);
                            }));
                        });

                        batch.execute();

                        Promise.all([namePromise, symbolPromise, totalSupplyPromise, decimalPromise])
                            .then(res => resolve(res.concat([tokenContract._address])))
                            .catch(err => reject());
                    })
                }

                Promise.all(tokenList.map(contract => getTokenInfo(contract)))
                    .then(res => resolve(res.map(p => {
                        return {
                            name: p[0],
                            symbol: p[1],
                            supply: (p[2] * 0.1 ** p[3]).toFixed(3),
                            address: p[4]
                        }
                    })))
                    .catch(err => reject(err));
            })

        },
        getTokenBalanceByAddress: (address) => {
            return new Promise((resolve, reject) => {
                const batch = new web3.BatchRequest();
                const balancePromise = (tokenContract, address) => new Promise((resolve, reject) => {
                    batch.add(tokenContract.methods.balanceOf(address).call.request({ from: address }, 'latest', (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }));
                });

                const promises = tokenList.map(t => balancePromise(t, address));
                batch.execute();
                Promise.all(promises)
                    .then(res => resolve(res.map((b, i) => {
                        return {
                            address: tokenList[i]._address,
                            balance: (b * 0.1 ** 3).toFixed(3)
                        }
                    })))
                    .catch(err => reject(err))
            })
        },
        getSGDbyAddress: (address) => {
            return new Promise((resolve, reject) => {
                sgdContract.methods.balanceOf(address).call()
                    .then(res => resolve((res * 0.1 ** 2).toFixed(2)))
                    .catch(err => reject(err));
            })
        },

        placeOrder: (from, token, price, amount) => {

        }
    }
}

export default SmartContactController;