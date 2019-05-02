const web3 = require('web3');
const express = require('express');
const Tx = require('ethereumjs-tx');
const ethJsUtil = require('ethereumjs-util')
var Eth = require('web3-eth');
var eth = new Eth("https://mainnet.infura.io/v3/4f365c578a9d46449394794259417c97");
const app = express();
var ETHERSCAN_API_KEY="G4MNQANBUU9JSXDZ3S95GUK3Z5VH8MFCKE";
var CONTRACT_ADDR="0x8dffd6644cf466d083fc6db8c61ad88443e48c99";
var api = require('etherscan-api').init(ETHERSCAN_API_KEY,'morden', '3000');
var abi=[{"constant":true,"inputs":[{"name":"value","type":"string"}],"name":"getCertsByContent","outputs":[{"name":"","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"value","type":"string"}],"name":"getCertsByProof","outputs":[{"name":"","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"beneficiary","type":"address"},{"name":"certHash","type":"string"},{"name":"version","type":"string"},{"name":"content","type":"string"}],"name":"newCertificate","outputs":[{"name":"certID","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"certificates","outputs":[{"name":"certHash","type":"string"},{"name":"issuer_addr","type":"address"},{"name":"recepient_addr","type":"address"},{"name":"version","type":"string"},{"name":"content","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"string_type","type":"uint256"},{"name":"value","type":"string"}],"name":"getMatchCountString","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"value","type":"address"}],"name":"getCertsByIssuer","outputs":[{"name":"","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"value","type":"string"}],"name":"getCertsByVersion","outputs":[{"name":"","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"value","type":"address"}],"name":"getCertsByRecepient","outputs":[{"name":"","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"addr_type","type":"uint256"},{"name":"value","type":"address"}],"name":"getMatchCountAddress","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}]


	
	
//Infura HttpProvider Endpoint

web3js = new web3(new web3.providers.HttpProvider("https://mainnet.infura.io/v3/4f365c578a9d46449394794259417c97"));
// verifySig?sig=0x0000&challenge=text
app.get('/verifySig',function(req,res){
	var sig = req.query.sig
	var challenge = req.query.challenge
	
	//challenge = "Certi.me proof for account 7";
	//sig = "0x52a6473cb4693cdcefee6dea1ed1665249e296d67fecd47b5ae37d511437d1c471686c1ab81a7bfcc1cf5a97664e4d695ca1699aee0407d108487cb13dd2b35e1c"
	//console.log(personal)
	
	const msg = new Buffer(challenge);
	const prefix = new Buffer("\x19Ethereum Signed Message:\n");
	const prefixedMsg = web3.utils.sha3(
	  Buffer.concat([prefix, new Buffer(String(msg.length)), msg])
	);
	
	//msg = web3.utils.sha3(web3.utils.utf8ToHex(challenge))
	//const echash = Buffer.from(sig.replace('0x',''), 'hex')
	//console.log(echash)
	sigarr = ethJsUtil.fromRpcSig(sig)
	pub = ethJsUtil.ecrecover(Buffer.from(prefixedMsg.replace('0x',''), 'hex'), sigarr.v, sigarr.r, sigarr.s);
	console.log(pub)
	res.send('0x'+ethJsUtil.pubToAddress(pub).toString("hex"))
	
})

// ethCall?method=certificates&param=certid
app.get('/ethcall', function(req,res){
	method=req.query.method;
	parameters=[req.query.param]
	//var res = api.proxy.eth_call('0xAEEF46DB4855E25702F8237E8f403FddcaF931C0', '0x70a08231000000000000000000000000e16359506c028e51f16be38986ec5746251e9724', 'latest');
	var request = api.proxy.eth_call(CONTRACT_ADDR, abiParse(method,parameters), 'latest').then(function(a){
		//console.log(res)
		console.log(method)
		console.log(a.result)
		console.log(abiDecode(method,a.result ))
		res.send(abiDecode(method,a.result ))
	});
	
	//console.log(res)
})
/*
	function ethCall(method,parameters,callBackFunction){
		$.post( "ethData.php",{data:abiParse(method,parameters),type:'certdata'},function( data) {
			callBackFunction(abiDecode(method,JSON.parse(data.response).result ));
		},'json').fail(
		function(jqXHR) {
			console.error(JSON.parse(jqXHR.responseText) );
		})
	}
	*/
	function abiParse(method,dataArray){
		var methodIndex=-1;
		for(var i=0;i<abi.length;i++){
			if(abi[i].name==method){
				methodIndex=i;
				break;
			}
		}
		if(methodIndex==-1){
			return false;
		}
		return eth.abi.encodeFunctionCall(abi[i], dataArray);
	}
	function abiDecode(method,data){
		var methodIndex=-1;
		for(var i=0;i<abi.length;i++){
			if(abi[i].name==method){
				methodIndex=i;
				break;
			}
		}

		if(methodIndex==-1){
			return false;
		}
		console.log(" >>>>  ABI DECODE")
		console.log(abi[i].outputs)
		return eth.abi.decodeParameters(abi[i].outputs, data);
	}

/*
function ethCall($data){

	global $ETHERSCAN_API_KEY;

	global $CONTRACT_ADDR;

	//0x70a08231000000000000000000000000e16359506c028e51f16be38986ec5746251e9724

	$result=json_decode(file_get_contents("http://api.etherscan.io/api?module=proxy&action=eth_call&to=".$CONTRACT_ADDR."&data=".$data."&tag=latest&apikey=".$ETHERSCAN_API_KEY),true);

	return ($result);

	

}

*/

app.get('/sendtx',function(req,res){



        var myAddress = 'ADDRESS_THAT_SENDS_TRANSACTION';

        var privateKey = Buffer.from('YOUR_PRIVATE_KEY', 'hex')

        var toAddress = 'ADRESS_TO_SEND_TRANSACTION';



        //contract abi is the array that you can get from the ethereum wallet or etherscan

        var contractABI =YOUR_CONTRACT_ABI;

        var contractAddress ="YOUR_CONTRACT_ADDRESS";

        //creating contract object

        var contract = new web3js.eth.Contract(contractABI,contractAddress);



        var count;

        // get transaction count, later will used as nonce

        web3js.eth.getTransactionCount(myAddress).then(function(v){

            console.log("Count: "+v);

            count = v;

            var amount = web3js.utils.toHex(1e16);

            //creating raw tranaction

            var rawTransaction = {"from":myAddress, "gasPrice":web3js.utils.toHex(20* 1e9),"gasLimit":web3js.utils.toHex(210000),"to":contractAddress,"value":"0x0","data":contract.methods.transfer(toAddress, amount).encodeABI(),"nonce":web3js.utils.toHex(count)}

            console.log(rawTransaction);

            //creating tranaction via ethereumjs-tx

            var transaction = new Tx(rawTransaction);

            //signing transaction with private key

            transaction.sign(privateKey);

            //sending transacton via web3js module

            web3js.eth.sendSignedTransaction('0x'+transaction.serialize().toString('hex'))

            .on('transactionHash',console.log);

                

            contract.methods.balanceOf(myAddress).call()

            .then(function(balance){console.log(balance)});

        })

    });

app.listen(3000, () => console.log('Example app listening on port 3000!'))