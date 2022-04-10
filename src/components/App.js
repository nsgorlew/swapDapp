import React, { Component, useState, useEffect } from 'react'
import logo from '../logo.png'
import './App.css'
import Navbar from './Navbar'
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
		console.log(this.state.ethBalance)
	}

	constructor(props) {
		super(props)
		this.state = {
			account: '',
			ethBalance: '0'
        }
    }

	render() {
	return (
		<div>
			<Navbar account={this.state.account} />
			<div className="container-fluid mt-5">
			  <div className="row">
				<main role="main" className="col-lg-12 d-flex text-center">
				  <div className="content mr-auto ml-auto">
					<h1>Decentralized Exchange for Swapping</h1>
				  </div>
				</main>
			  </div>
			</div>
		  </div>
		);
	}
}

export default App;
