const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3'); 
const web3 = new Web3(ganache.provider());
// imports the ABI(interface) and the bytecode from compile.js
const { interface, bytecode } = require('../compile'); 


let accounts; 
let lottery;

beforeEach(async () => {
  //get a list of all accounts
  accounts = await web3.eth.getAccounts();

  //use one of those accounts to deploy the contract
  lottery = await new web3.eth.Contract(JSON.parse(interface))
      .deploy({ data: '0x' + bytecode, arguments: ['so tests dont fail string'] })
      .send({ from: accounts[0], gas: '1000000' });
});

describe('Lottery Contract', () => {
  it('deploys a contract', () => {
    assert.ok(lottery.options.address);
  });

  it('Allows an account to enter', async () => {
    await lottery.methods.enter().send({
      from: accounts[0], 
      value: web3.utils.toWei('0.02', 'ether')
    });

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    });

    assert.equal(accounts[0], players[0]);
    assert.equal(1, players.length);
  }); 


  it('Allows multiple accounts to enter', async () => {
    await lottery.methods.enter().send({
      from: accounts[0], 
      value: web3.utils.toWei('0.02', 'ether')
    });

    await lottery.methods.enter().send({
      from: accounts[1], 
      value: web3.utils.toWei('0.02', 'ether')
    });

    await lottery.methods.enter().send({
      from: accounts[2], 
      value: web3.utils.toWei('0.02', 'ether')
    });

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    });

    assert.equal(accounts[0], players[0]);
    assert.equal(accounts[1], players[1]);
    assert.equal(accounts[2], players[2]);
    assert.equal(3, players.length);
  });  


  it('requires a minimum amount of ether to enter', async () => {
    try {   
      await lottery.methods.enter().send({
        from: accounts[0],
        value: 100
      });
      assert(false); 
    } catch (err) {
      assert(err); 
    }
  });


  it('allows only the manager to call pick_winner', async () => {
    try {
      await lottery.methods.pickWinner().send({
        from: accounts[1]
      });
      assert(false);
    } catch (err){
      assert(err);
    }
  });


  it('sends all money to the winnner and resets the players array', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('2', 'ether') // enter 2 ether. note only one account enters lottery. 
    });

    const initialBalance = await web3.eth.getBalance(accounts[0]);  //get account balance before pick_winner is called (only 1 account entered for testing simplicity)
    await lottery.methods.pickWinner().send({ from: accounts[0] }); //pick winner (sends all to the only account entered)
    const finalBalance = await web3.eth.getBalance(accounts[0]);    // get account balance after pick_winner is called
    
    const difference = finalBalance - initialBalance;               // calc difference in ether
    assert(difference > web3.utils.toWei('1.99', 'ether'));         // assert difference is < 2ether (becasue gas cost)

    const lotteryBalance = await web3.eth.getBalance(lottery.options.address);

    assert(lotteryBalance == 0)                     // make sure this contract's balance is 0
    assert(lottery.methods.players.length == 0);    // make sure players array is empty
  });

}); // end of Lottery describe test
















