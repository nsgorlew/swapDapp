//testing the smart contract functions
const Token = artifacts.require("Token");
const Swap = artifacts.require("Swap");

require('chai').use(require('chai-as-promised')).should()

//convert wei to ether for readability and usability
function tokensHelper(n) {
    return web3.utils.toWei(n, 'ether');
}

contract('Swap', ([deployer, investor]) => {
    let token, swap

    before(async () => {
        token = await Token.new()
        swap = await Swap.new(token.address)
        //transfer tokens to Swap
        await token.transfer(swap.address, tokensHelper('1000000'))
    })

    //check contract names
    describe('Token deployment', async () => {
        it('contract has a name', async () => {
            const name = await token.name()
            assert.equal(name, 'DApp Token')
        })
    })

    describe('Swap deployment', async () => {
        it('contract has a name', async () => {
            const name = await swap.name()
            assert.equal(name, 'Decentralized Exchange')
        })
        //check token balance correctly transferred to contract
        it('contract has tokens', async () => {
            let balance = await token.balanceOf(swap.address)
            assert.equal(balance.toString(), tokensHelper('1000000'))
        })
    })

    describe('buyTokens()', async () => {
        let result
        before(async () => {
            result = await swap.buyTokens({ from: investor, value: web3.utils.toWei('1', 'ether') })
        })

        it('Allows token purchasing for fixed price', async () => {
            //verify transfer

            let investorBalance = await token.balanceOf(investor)
            assert.equal(investorBalance.toString(), tokensHelper('100'))

            let swapBalance
            swapBalance = await token.balanceOf(swap.address)
            assert.equal(swapBalance.toString(), tokensHelper('999900'))
            swapBalance = await web3.eth.getBalance(swap.address)
            assert.equal(swapBalance.toString(), web3.utils.toWei('1', 'ether'))

            const event = result.logs[0].args
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), tokensHelper('100').toString())
            assert.equal(event.rate.toString(),'100')
        })
    })

    describe('sellTokens()', async () => {
        let result
        before(async () => {
            //investor approves purchase
            await token.approve(swap.address, tokensHelper('100'), { from: investor })
            result = await swap.sellTokens(tokensHelper('100'), {from: investor})
        })

        it('Allows for selling of tokens at a fixed price', async () => {
            let investorBalance = await token.balanceOf(investor)
            assert.equal(investorBalance.toString(), tokensHelper('0'))

            //make sure swap of tokens was successful
            let swapBalance
            swapBalance = await token.balanceOf(swap.address)
            assert.equal(swapBalance.toString(), tokensHelper('1000000'))
            swapBalance = await web3.eth.getBalance(swap.address)
            assert.equal(swapBalance.toString(), web3.utils.toWei('0', 'ether'))

            //ensure emit correct
            const event = result.logs[0].args
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), tokensHelper('100').toString())
            assert.equal(event.rate.toString(), '100')

            //make sure investor cant sell what they dont have
            await swap.sellTokens(tokensHelper('400'), { from: investor }).should.be.rejected;
        })
    })

})