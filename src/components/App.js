import React, { Component, useState, useEffect } from 'react'
import logo from '../logo.png'
import './App.css'
import Swap from '../abis/Swap.json'
import Token from '../abis/Token.json'
import Navbar from './Navbar'
import Main from './Main'
import Web3 from 'web3'

class App extends Component {

	async componentWillMount() {
		await this.loadWeb3()
		await this.loadUserData()
	}

	async loadWeb3() {
		if (window.ethereum) {
			window.web3 = new Web3(window.ethereum)
			await window.ethereum.enable()
		}
		else if (window.web3) {
			window.web3 = new Web3(window.web3.currentProvider)
		}
		else {
			window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
		}
	}

	async loadUserData() {
		const web3 = window.web3
		const accounts = await web3.eth.getAccounts()
		this.setState({ account: accounts[0]})

		const ethBalance = await web3.eth.getBalance(this.state.account)
		this.setState({ ethBalance: ethBalance })

		//get smart contract abi's and addresses for frontend
		const networkId = await web3.eth.net.getId()
		//load token data

		const tokenData = Token.networks[networkId]
		if (tokenData) {
			const address = tokenData.address
			const token = new web3.eth.Contract(Token.abi, tokenData.address)
			this.setState({ token })
			let tokenBalance = await token.methods.balanceOf(this.state.account).call()
			//console.log("tokenBalance: ", tokenBalance.toString())
			this.setState({ tokenBalance: tokenBalance.toString() })
		} else {
			window.alert("Contract not deployed to detected network")
		}

		//load swap data
		const swapData = Swap.networks[networkId]
		if (swapData) {
			const swap = new web3.eth.Contract(Swap.abi, swapData.address)
			this.setState({ swap })
		} else {
			window.alert("Contract not deployed to detected network")
		}

		this.setState({loading: false})
		//console.log(this.state.swap)
	}

	constructor(props) {
		super(props)
		this.state = {
			account: '',
			token: {},
			swap: {},
			ethBalance: '0',
			tokenBalance: '0',
			loading: true
		}
	}

	render() {
		let content
		if (this.state.loading) {
			content = <p id="loader" className="text-center">Loading data...</p>
		} else {
			content = <Main />
        }
	return (
		<div>
			<Navbar account={this.state.account} />
			<div className="container-fluid mt-5">
			  <div className="row">
					<main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
				  <div className="content mr-auto ml-auto">
							{content}
				  </div>
				</main>
			  </div>
			</div>
		  </div>
		);
	}
}

export default App;
