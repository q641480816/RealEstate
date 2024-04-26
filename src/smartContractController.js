import Web3 from 'web3';
import Decimal from 'decimal.js';
import orderBookContractJson from './abi/SellOrderBook.json';
import propertyAContractJson from './abi/PROPERTYA.json';
import propertyBContractJson from './abi/PROPERTYB.json';
import propertyCContractJson from './abi/PROPERTYC.json';
import propertyDContractJson from './abi/PROPERTYD.json';
import sgdContractJson from './abi/SUPERSGD.json';

const SmartContactController = (uperWeb3) => {

    let web3 = uperWeb3 ? uperWeb3 : new Web3(new Web3.providers.HttpProvider('HTTP://127.0.0.1:7545'));

    const orderBookContract = new web3.eth.Contract(orderBookContractJson.abi, orderBookContractJson.address)
    const propertyAContract = new web3.eth.Contract(propertyAContractJson.abi, propertyAContractJson.address)
    const propertyBContract = new web3.eth.Contract(propertyBContractJson.abi, propertyBContractJson.address)
    const propertyCContract = new web3.eth.Contract(propertyCContractJson.abi, propertyCContractJson.address)
    const propertyDContract = new web3.eth.Contract(propertyDContractJson.abi, propertyDContractJson.address)
    const sgdContract = new web3.eth.Contract(sgdContractJson.abi, sgdContractJson.address)

    const tokenList = [propertyAContract, propertyBContract, propertyCContract, propertyDContract];
    // console.log(propertyAContract.methods)

    const formatNumber = (n, p) => {
        let BN = web3.utils.BN;
        return new BN(Decimal(n).times(10 ** p).toString());
    }

    const checkAllowence = (token, from, by, amount) => {
        let contract = tokenList.filter(c => c._address === token)[0];
        if (!contract) contract = sgdContract;

        return new Promise((resolve, reject) => {
            contract.methods.allowance(from, by).call()
                .then(allowance => {
                    if (allowance < amount) {
                        contract.methods.approve(by, amount - allowance).send({ from: from })
                            .on('transactionHash', (hash) => {
                                console.log('Transaction Hash:', hash);
                            })
                            .on('confirmation', (confirmationNumber, receipt) => {
                                console.log('Confirmation Number:', confirmationNumber);
                                console.log('Transaction Receipt:', receipt);
                            })
                            .on('receipt', (receipt) => {
                                console.log('Transaction has been included in the block:', receipt.blockNumber);
                                resolve(receipt)
                            })
                            .on('error', (err) => reject(err));
                    } else {
                        resolve()
                    }
                })
                .catch(err => reject(err))
        })
    }

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
                    .then(res => resolve((res * 0.1 ** 5).toFixed(2)))
                    .catch(err => reject(err));
            })
        },
        getOrders: () => {
            return new Promise((resolve, reject) => {
                orderBookContract.methods.getAllOrders().call()
                    .then(res => resolve(res))
                    .catch(err => reject(err));
            })
        },
        placeOrder: (from, token, price, amount) => {
            return new Promise((resolve, reject) => {
                checkAllowence(token, from, orderBookContract._address, formatNumber(amount, 3))
                    .then(res => {
                        orderBookContract.methods.placeOrder(token, formatNumber(amount, 3), formatNumber(price, 5)).send({ from: from })
                            .on('transactionHash', (hash) => {
                                console.log('Transaction Hash:', hash);
                            })
                            .on('confirmation', (confirmationNumber, receipt) => {
                                console.log('Confirmation Number:', confirmationNumber);
                                console.log('Transaction Receipt:', receipt);
                            })
                            .on('receipt', (receipt) => {
                                console.log('Transaction has been included in the block:', receipt.blockNumber);
                                resolve(receipt);
                            })
                            .on('error', err => reject(err));
                    })
            })

        },
        checkAllowence: checkAllowence,
        cancelOrder: (id, from) => {
            return new Promise((resolve, reject) => {
                orderBookContract.methods.cancelOrder(id).send({ from: from })
                    .on('transactionHash', (hash) => {
                        console.log('Transaction Hash:', hash);
                    })
                    .on('confirmation', (confirmationNumber, receipt) => {
                        console.log('Confirmation Number:', confirmationNumber);
                        console.log('Transaction Receipt:', receipt);
                    })
                    .on('receipt', (receipt) => {
                        console.log('Transaction has been included in the block:', receipt.blockNumber);
                        resolve(receipt);
                    })
                    .on('error', err => reject(err));
            })
        },
        fulfillOrder: (from, id, units, price, seller) => {

            return new Promise((resolve, reject) => {
                console.log(price)
                // console.log(formatNumber(price, 0))
                    checkAllowence(sgdContract._address, from, orderBookContract._address, Decimal(units).times(price))
                        .then(res => {
                            orderBookContract.methods.fulfillOrder(id, formatNumber(units, 3)).send({ from: from })
                                .on('transactionHash', (hash) => {
                                    console.log('Transaction Hash:', hash);
                                })
                                .on('confirmation', (confirmationNumber, receipt) => {
                                    console.log('Confirmation Number:', confirmationNumber);
                                    console.log('Transaction Receipt:', receipt);
                                })
                                .on('receipt', (receipt) => {
                                    console.log('Transaction has been included in the block:', receipt.blockNumber);
                                    resolve(receipt);
                                })
                                .on('error', err => reject(err));
                        })
            })
        }
    }
}

export default SmartContactController;