const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');

const provider = new HDWalletProvider(
  'frog drift question patch century make female garment demand undo gentle unhappy',
  'https://rinkeby.infura.io/P9cWIMe0PO6n3SWQcYzE'
);
const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();

    console.log('Attempting to deploy from account', accounts[0]);

    const result = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: '0x' + bytecode, arguments: ['so tests dont fail string'] })
        .send({ gas: '1000000', from: accounts[0] });

    console.log(interface);
    console.log('Contract deployed to', result.options.address);

};
deploy();
// every time you deploy, 
// update the address and ABI in lottery-react/lottery.js
// to ensure front-end is connunicating to the current contract 




