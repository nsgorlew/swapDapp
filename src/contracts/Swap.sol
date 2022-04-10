pragma solidity ^0.5.0;

//import Token contract
import "./Token.sol";

contract Swap {
	string public name = "Decentralized Exchange";
	Token public token;
	//define redemption rate
	uint public rate = 100;
	//prevent reentrancy
	bool public flagg;

	event tokensPurchased(
		address account,
		address token,
		uint amount,
		uint rate
	);

		event tokensSold(
		address account,
		address token,
		uint amount,
		uint rate
	);

	constructor(Token _token) public {
		token = _token;
	}

	function buyTokens() public payable {
		uint tokenAmount = msg.value * rate;

		//prevent overdrawing
		require((token.balanceOf(address(this)) >= tokenAmount) && !flagg);

		//transfer tokens
		flagg = true;
		token.transfer(address(msg.sender), tokenAmount);

		//emit event
		emit tokensPurchased(msg.sender, address(token), tokenAmount, rate);
		flagg = false;
	}

	function sellTokens(uint _amount) public {
		//cannot oversell
		require(token.balanceOf(msg.sender) >= _amount);

		//calc the eth
		uint ethAmount = _amount / rate;

		require(address(this).balance >= ethAmount);

		//give user eth
		//use ERC20 transfer function
		token.transferFrom(msg.sender, address(this), _amount);
		msg.sender.transfer(ethAmount);

		emit tokensSold(msg.sender, address(token), _amount, rate);
	}
	
}