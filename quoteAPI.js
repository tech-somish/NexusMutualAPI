var app = require('express')();
const helmet = require('helmet');
require('dotenv').config()
app.use(helmet());
var http = require('http');
const Json2csvParser = require('json2csv').Parser;
var fs = require('fs');
var Client = require('node-rest-client').Client;
var Web3 = require('web3');
var util = require('ethereumjs-util');
var tx = require('ethereumjs-tx');
var lightwallet = require('eth-lightwallet');
var txutils = lightwallet.txutils;
var api = require('etherscan-api').init('YourApiKey');
const { runScript } = require('./backend.js');
const fields = ['address'];
const dir = './Correlation/';
const Joi =require('joi');
var MongoClient = require('mongodb').MongoClient;

// all helmet configuration comes here
app.use(helmet.frameguard({ action: 'deny' }));
app.use(helmet.xssFilter());
app.use(helmet.noSniff());
app.use(helmet.ieNoOpen());

var ninetyDaysInMilliseconds = 90 * 24 * 60 * 60 * 1000;
app.use(helmet.hsts({ maxAge: ninetyDaysInMilliseconds }));
app.use(helmet.dnsPrefetchControl());

// helmet configuration ends
app.disable('x-powered-by');

var _ = require("lodash");
const WEB3_ENDPOINT=process.env.EndPoint;
const wallet = require('eth-lightwallet').keystore ;
const wallet1 = require('eth-lightwallet') ;
var web3=new Web3(new Web3.providers.HttpProvider(WEB3_ENDPOINT));
var BN = require("bn.js");
var ethABI = require("ethereumjs-abi");

var ConstDate = Math.floor(Date.now() / 1000);
var Price_Floor=0.02;
var Time_Since_Deployment_Max=250;
var Gas_Adjustment=100000;
var Transactions=5000;
var ETH_Held=50;
var Days_reduction_NXM=10;
var NXMPriceGBP=10;
var Price_Floor_with_Staking=0.01;
var salesCommision=0.2;
var capacityBufferValue=0;
var coverperiod;
var STLP;
var STL;
var PM;
var minCorel = 0.85;

var daysAvgEth=30;  //Eth balance Avg for what number of days
var avgTxPerDay=5760; //avg transaction per day
var expireTimeForRequestedCover=3600; //In seconds
var _password=process.env.metaMaskPassword; //Password for metamask for signature of coverdetails
var count = [];
var url = process.env.mongodbSever;

var args = {
    "headers": {
        "x-api-key": process.env.apiKey,
        "cache-control": "no-cache"
    } // request headers
    };

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/SmartCASign/:coverAmount/:coverCurr/:coverPeriod/:smartCA/:Version', function(req, res)
{
  req.setTimeout(0);
  var CP;
  var SA;
  var abiData=[];
  var contr;
  var curr;
  var Version;


  web3=new Web3(new Web3.providers.HttpProvider(WEB3_ENDPOINT));

  contr=req.params.smartCA.toString();
  SA=req.params.coverAmount.toString();
  SA=parseFloat(SA);
  CP=req.params.coverPeriod.toString();
  CP=parseInt(CP);
  curr=req.params.coverCurr.toString();
  Version=req.params.Version.toString();

  const schema = {
    coverAmount: Joi.number(),
    coverCurr: Joi.string(),
    coverPeriod: Joi.number(),
    smartCA: Joi.string(),
    version: Joi.string().alphanum().length(2),
  };
  const { error1, value } = Joi.validate({ version: Version }, schema);
  if (error1 != null) {
    res.send(value);
  } else {

  }

  getVersion( function (response, data) 
  {
    if(data != undefined)
    {
      abiData = JSON.parse(data);
       web3.eth.contract(NXMasterAbi).at(NXMasterAddress, function (errorNXM, nxmasterInstance) {
      if (!errorNXM) {
              nxmasterInstance.getVersionData(function(errAddr,resAddr){
                if(!errAddr){
                  contractAddresses = resAddr[1];

                  var filteredAbi=getABiFiltered_sign('quotationData',abiData);
                  quotationDataAbi=filteredAbi[0].contractAbi;
                  quotationDataContractAddress=contractAddresses[0];
                  quotationDataContract = web3.eth.contract(JSON.parse(quotationDataAbi));
                  quotationDataInstance =quotationDataContract.at(quotationDataContractAddress);

                  quotationContractAddress = contractAddresses[4];

                  var filteredAbi=getABiFiltered_sign('tokenFunction',abiData);
                  tokenAbi=filteredAbi[0].contractAbi;
                  tokenContractAddress=contractAddresses[5];
                  tokenContract = web3.eth.contract(JSON.parse(tokenAbi));
                  tokenInstance =tokenContract.at(tokenContractAddress);
            
                  var filteredAbi=getABiFiltered_sign('mcr',abiData);
                  mcrAbi=filteredAbi[0].contractAbi;
                  mcrContractAddress=contractAddresses[11];
                  mcrContract = web3.eth.contract(JSON.parse(mcrAbi));
                  mcrInstance =mcrContract.at(mcrContractAddress);
            
                  var filteredAbi=getABiFiltered_sign('poolData',abiData);
                  poolDataAbi=filteredAbi[0].contractAbi;
                  poolDataContractAddress=contractAddresses[3];
                  poolDataContract = web3.eth.contract(JSON.parse(poolDataAbi));
                  poolDataInstance =poolDataContract.at(poolDataContractAddress);

                  var productDetails = quotationDataInstance.getProductDetails();
                  PM = productDetails[1]/100;
                  STLP = productDetails[3]/1;
                  STL = productDetails[2]/100;
                  coverperiod = productDetails[0]/1;
                  var capReached = poolDataInstance.capReached();
                  if(capReached != 1)
                    res.end(JSON.stringify({reason:"minCapNotReached", coverAmount:0}));
                  else
                  {
                  allowedToCoverContractCheck(contr,Version,function(err,data){
                if(data == "true")
                {
                  getMCRData_sign(res,curr,contr,CP,SA,Version);
                }
                else
                {
                  res.end(JSON.stringify({reason:data, coverAmount:0}));
                }
                  });
                }
                }
                else{
                  console.log(errAddr);
                  res.end("Error in getVersionData");
                }
              }.bind(this));
      }
  });


    
      
      
    }
    else
      res.end("error while retriving abi and contract address");
    
  });
  
});

var NXMasterAddress = process.env.NXMasterAddress;
var NXMasterAbi = [{"constant":true,"inputs":[],"name":"pauseTime","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"contractsActive","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_toCheck","type":"address"}],"name":"isAuthorizedToGovern","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"emergencyPaused","outputs":[{"name":"pause","type":"bool"},{"name":"time","type":"uint256"},{"name":"by","type":"bytes4"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"tokenAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"masterAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_tokenAdd","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"constant":false,"inputs":[{"name":"_contractsName","type":"bytes2"},{"name":"_contractsAddress","type":"address"}],"name":"upgradeContractImplementation","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"myid","type":"bytes32"}],"name":"delegateCallBack","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"code","type":"bytes8"}],"name":"getAddressParameters","outputs":[{"name":"codeVal","type":"bytes8"},{"name":"val","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"code","type":"bytes8"}],"name":"getOwnerParameters","outputs":[{"name":"codeVal","type":"bytes8"},{"name":"val","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_pause","type":"bool"},{"name":"_by","type":"bytes4"}],"name":"addEmergencyPause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_time","type":"uint256"}],"name":"updatePauseTime","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"masterInitialized","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getPauseTime","outputs":[{"name":"_time","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_contractsName","type":"bytes2"},{"name":"_contractsAddress","type":"address"}],"name":"upgradeContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_add","type":"address"}],"name":"isInternal","outputs":[{"name":"check","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_add","type":"address"}],"name":"isOwner","outputs":[{"name":"check","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"isPause","outputs":[{"name":"check","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_add","type":"address"}],"name":"isMember","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"index","type":"uint256"}],"name":"getEmergencyPauseByIndex","outputs":[{"name":"_index","type":"uint256"},{"name":"_pause","type":"bool"},{"name":"_time","type":"uint256"},{"name":"_by","type":"bytes4"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getEmergencyPausedLength","outputs":[{"name":"len","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getLastEmergencyPause","outputs":[{"name":"_pause","type":"bool"},{"name":"_time","type":"uint256"},{"name":"_by","type":"bytes4"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_masterAddress","type":"address"}],"name":"changeMasterAddress","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getVersionData","outputs":[{"name":"contractsName","type":"bytes2[]"},{"name":"contractsAddress","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"dAppLocker","outputs":[{"name":"_add","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"dAppToken","outputs":[{"name":"_add","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_contractName","type":"bytes2"}],"name":"getLatestAddress","outputs":[{"name":"contractAddress","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_contractAddresses","type":"address[]"}],"name":"addNewVersion","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_add","type":"address"}],"name":"checkIsAuthToGoverned","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"startEmergencyPause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"code","type":"bytes8"},{"name":"val","type":"address"}],"name":"updateAddressParameters","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"code","type":"bytes8"},{"name":"val","type":"address"}],"name":"updateOwnerParameters","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}];
var contractAddresses = [];

async function allowedToCoverContractCheck(contAdd,version,callback)
{
	var url = process.env.dynamoDBDomain + 'checkIsHacked/' + contAdd + '/' + version;
	var client = new Client();
	  client.registerMethod("jsonMethod", url, "GET");
	  client.methods.jsonMethod(args, function (data, response) 
	  {
	  	if(data != undefined){
	  		if(data.toString() == "false") {
	  			
		  		var url="https://api.etherscan.io/api?module=contract&action=getabi&address="+contAdd+"&apikey=YourApiKeyToken";
			    var client = new Client();
			    client.registerMethod("jsonMethod", url, "GET");
			    client.methods.jsonMethod(function (data, response) 
			    {

			        if(data!=undefined)
			        {

			        if(data.message=="OK"){
			          callback(null,"true");
			        }
			        else
			          callback(null,"Not verified on etherscan");

			      	}
			      	else
			        	callback(null,"error");

			    
			  	});
		}
		else
			callback(null,"Hacked");
	  	}
	  	else
	  		callback(null,"error");
	  });
}

function isContract_sign(Add,main,contract,res,stakedNXM,distContract,CP,SA,totalGas,reqNum,result,internalTx,contr,curr,avgRate,tokenPriceCurr,Version)
{

  var url="https://api.etherscan.io/api?module=account&action=txlist&page=1&offset=1&address=" + Add + "&startblock=0&endblock=latest&sort=asc";
  var client = new Client();
  client.registerMethod("jsonMethod", url, "GET");
  client.methods.jsonMethod(function (addressData, response) 
  { 
    if(addressData.result==undefined && addressData.message != "OK")
      if(main==1)
            res.end("Error: Undefined");
      else
      {
        count[reqNum]++;
        if (distContract.length==count[reqNum] || count[reqNum]==1000)
            getBalanceETH_sign(contr,res,stakedNXM,CP,SA,curr,result,avgRate,tokenPriceCurr,Version);
      }
    else
    {
      if(addressData.result.length>0)
      {
          var flag=0;
          if(addressData.result[0].contractAddress=="" && addressData.message!="OK")
            flag=1;
          else if (distContract.length==0)
          {
            if(Add==addressData.result[0].contractAddress)
              flag=0;
          }
          else if(distContract.length>0)
          {
            for (var i = 0; i < distContract.length; i++)
            {
              if(distContract[i].add==addressData.result[0].contractAddress)
              {
                flag=0;
                break;
              }
              flag=1;
            }
          }
          if(flag==0)
          {

            if(main==1)
            {

              result.contractAdd=addressData.result[0].contractAddress;
              var d = new Date(addressData.result[0].timeStamp*1000);
              result.DeployDate = d.getDate()  +'/' + (d.getMonth()+1) + '/' + d.getFullYear();
              result.timeStamp=addressData.result[0].timeStamp;
              result.GasUsed = addressData.result[0].gasUsed;
              result.TotalGasUsed=0;
              getTransactionCount_sign(Add,res,stakedNXM,distContract,CP,SA,totalGas,reqNum,result,internalTx,contr,curr,avgRate,tokenPriceCurr,Version);
            }
            else
            {
              contract.contractAdd=addressData.result[0].contractAddress;
              contract.gasUsed=addressData.result[0].gasUsed;
              result.InternalTx.push(contract);
              totalGas+=parseInt(contract.gasUsed);
              result.TotalGasUsed=totalGas;

              count[reqNum]++;
              if (distContract.length==count[reqNum] || count[reqNum]==1000){
                getBalanceETH_sign(contr,res,stakedNXM,CP,SA,curr,result,avgRate,tokenPriceCurr,Version);
              }
            }
          }
          else
          {

            if(main==1)
              res.end("Error: Invalid Contract address or no such Contract address found in Mainnet");
            else
            {

              count[reqNum]++;
              if (distContract.length==count[reqNum] || count[reqNum]==1000){
                  getBalanceETH_sign(contr,res,stakedNXM,CP,SA,curr,result,avgRate,tokenPriceCurr,Version);
              }
            }
          }
      }
      else
      {
        if(main==1 && addressData.message != "OK"){

            res.end("Error: Invalid Contract address or no such Contract address found in Mainnet");
        }
        else
        {
          count[reqNum]++;
          if (distContract.length==count[reqNum] || count[reqNum]==1000)
              getBalanceETH_sign(contr,res,stakedNXM,CP,SA,curr,result,avgRate,tokenPriceCurr,Version);
        }
      }
    }
  
   });
}

function getTransactionCount_sign(Add,res,stakedNXM,distContract,CP,SA,totalGas,reqNum,result,internalTx,contr,curr,avgRate,tokenPriceCurr,Version)
{
  var url="https://api.ethplorer.io/getAddressInfo/"+ Add +"?apiKey=freekey";
  var client = new Client();
  client.registerMethod("jsonMethod", url, "GET");
  client.methods.jsonMethod(function (data, response) 
  {
    if(data!=undefined)
    {
      
      result.TransCount = data.countTxs;
      internalTX_sign(Add,res,stakedNXM,distContract,CP,SA,totalGas,reqNum,result,internalTx,contr,curr,avgRate,tokenPriceCurr,Version);

    }
    else{
      res.end("error in ethplorer");
    }
  });
}

function internalTX_sign(Add,res,stakedNXM,distContract,CP,SA,totalGas,reqNum,result,internalTx,contr,curr,avgRate,tokenPriceCurr,Version)
{
  var url="http://api.etherscan.io/api?module=account&action=txlistinternal&address="+ Add +"&startblock=0&endblock=latest&page=1&offset=1&sort=asc";
  var client = new Client();
  client.registerMethod("jsonMethod", url, "GET");    
  client.methods.jsonMethod(function (data, response) {
  if(data.result.length>0){
  	var txlist1 = api.account.txlistinternal(null,Add)
  	txlist1.then(function(res2)
  	{
    	if(res2.result.length>0){
    	  	internalTx=res2.result;
      		distinctContract_sign(Add,res,distContract,CP,SA,stakedNXM,totalGas,reqNum,result,internalTx,contr,curr,avgRate,tokenPriceCurr,Version);
    }
    	else{
      		getBalanceETH_sign(contr,res,stakedNXM,CP,SA,curr,result,avgRate,tokenPriceCurr,Version);
    	}
  	});
	}
	else
	{
	  	getBalanceETH_sign(contr,res,stakedNXM,CP,SA,curr,result,avgRate,tokenPriceCurr,Version);
	}
  });
}

function distinctContract_sign(address,res,distContract,CP,SA,stakedNXM,totalGas,reqNum,result,internalTx,contr,curr,avgRate,tokenPriceCurr,Version)
{
  distContract = [];
  var lookup = {};
  var items = internalTx;
  for (var item, i = 0,l=0; item = items[i++];) 
  {
   var from = item.from.toLowerCase();
   var to = item.to.toLowerCase();

    if (!(from in lookup) ) 
    {
      if( from!=address)
      {
        var flag=0;
        for(var j = 0; j < distContract.length; j++) 
        {
          if(distContract[j]==from)
          {
            flag=1;
            break;
          }
          else flag=0;
        }
        if(flag==0)
        {
          lookup[from] = 1;
          if(from!="")
          distContract.push({add:from,from_to:"from"});
          
        }
      }
    }
    if (!(to in lookup) ) 
    {
      if(to!=address)
      {
        var flag=0;
        for (var k = 0; k < distContract.length; k++) 
        {
          if(distContract[k]==to)
          {
            flag=1;
            break;
          }
          else flag=0;
        }
        if(flag==0)
        {
          lookup[to] = 1;
          if(to!="")
          distContract.push({add:to,from_to:"to"});
          
        }
      }
    }
    
    if(l==internalTx.length-1){
      callIScontract(distContract,res,stakedNXM,distContract,CP,SA,totalGas,reqNum,result,internalTx,contr,curr,avgRate,tokenPriceCurr,Version);
    }
    l++;
  }
}

function callIScontract(data,res,stakedNXM,distContract,CP,SA,totalGas,reqNum,result,internalTx,contr,curr,avgRate,tokenPriceCurr,Version)
{

	if(data.length == 0)
	{
	  getBalanceETH_sign(contr,res,stakedNXM,CP,SA,curr,result,avgRate,tokenPriceCurr,Version);
	}
	else{
    data = data.slice(0,1000);
	  data.forEach(function(dataItem, i){
	  isInstance.isContract(dataItem.add,function(errorIsCon,resultIsCon){
	    if(resultIsCon){
	    isContract_sign(dataItem.add,0,{from_to:dataItem.from_to},res,stakedNXM,distContract,CP,SA,totalGas,reqNum,result,internalTx,contr,curr,avgRate,tokenPriceCurr,Version);
	    
	    }
	    else {
	      count[reqNum]++;
	      if(count[reqNum]==distContract.length || count[reqNum]==1000)
	        getBalanceETH_sign(contr,res,stakedNXM,CP,SA,curr,result,avgRate,tokenPriceCurr,Version);
	    }
	  });
	});
	}
}

// function getBalanceETH_sign(Add,res,stakedNXM,CP,SA,curr,result,avgRate,tokenPriceCurr,Version)
// {
//   var sum=0;
//   var blockno1 = 0;
//   web3 = new Web3(new Web3.providers.HttpProvider(process.env.MainnetEndPoint));
//     blockno1=web3.eth.blockNumber;
    
//     for(var i=blockno1,c=0;i>=0&&c<daysAvgEth;i=i-avgTxPerDay,c++)
//     {
      
//      console.log(Add,i); 
//      web3.eth.getBalance(Add,i,function(error1,result1)
//      {
//       if(typeof(parseFloat(result1))=="number" )
//       {
        
//         if(typeof(parseFloat(result1))=="number" ){
//           c--; 
          
//           sum+=parseFloat(result1)/1000000000000000000;  
//           console.log("Balance Day" + i + " " + result1);
//         }
      
//       else{
//         c--;
//         sum+=0; 
//       }
//       if(c==0)
//       {  
//         var DeployDate = Number(result.timeStamp);
//         result.BalanceETH=sum/daysAvgEth;
//         if(Math.ceil(Number(ConstDate-DeployDate)/Number(3600*24))<daysAvgEth)
//           result.BalanceETH=result.BalanceETH/daysAvgEth*Math.ceil(Number(ConstDate-DeployDate)/Number(3600*24));

// 		console.log("result---> ",result);
// 	        RiskCost_sign(res,stakedNXM,CP,SA,curr,Add,result,avgRate,tokenPriceCurr,Version);
//       }

//       }
//       else
//       {
//         res.end(error1);
//       }
//      });
 
 
//     }
// }
function getBalanceETH_sign(Add,res,stakedNXM,CP,SA,curr,result,avgRate,tokenPriceCurr,Version)
{
 var sum=0;
 var blockno1 = 0;
 web3 = new Web3(new Web3.providers.HttpProvider(process.env.MainnetEndPoint));
   blockno1=web3.eth.blockNumber;

   for(var i=blockno1,c=0;i>=0&&c<daysAvgEth;i=i-avgTxPerDay,c++)
   {

    var url = "https://blockscout.com/eth/mainnet/api?module=account&action=eth_get_balance&address="+Add+"&block="+i;
    var client = new Client();
      client.registerMethod("jsonMethod", url, "GET");
      client.methods.jsonMethod( function (result1, response)
    {
        if(result1.error==undefined)
            result1 = result1.result*1;
        else
            result1 = 0;

     if(typeof(parseFloat(result1))=="number" )
     {

       if(typeof(parseFloat(result1))=="number" ){
         c--;

         sum+=parseFloat(result1)/1000000000000000000;
       }

     else{
       c--;
       sum+=0;
     }
     if(c==0)
     {
       var DeployDate = Number(result.timeStamp);
       result.BalanceETH=sum/daysAvgEth;
       if(Math.ceil(Number(ConstDate-DeployDate)/Number(3600*24))<daysAvgEth)
         result.BalanceETH=result.BalanceETH/daysAvgEth*Math.ceil(Number(ConstDate-DeployDate)/Number(3600*24));
       RiskCost_sign(res,stakedNXM,CP,SA,curr,Add,result,avgRate,tokenPriceCurr,Version);
     }

     }
     else
     {
       res.end(error1);
     }
    });


   }
}
function RiskCost_sign(res,stakedNXM,CP,SA,curr,contr,result,avgRate,tokenPriceCurr,Version)
{
  var relatedContracts = [];
  var RS={};
  var QD={};
  var DeployDate = Number(result.timeStamp);
  RS.DaySinceDeploy = Math.ceil(Number(ConstDate-DeployDate)/Number(3600*24));
  console.log("internal gasUSed-->",result.TotalGasUsed,"contr gas used ",result.GasUsed);
  RS.GasAdj = Number(((Number(result.GasUsed)+Number(result.TotalGasUsed))/Gas_Adjustment).toFixed(2));
  RS.TransAdj = Number(result.TransCount)/Transactions;
  RS.ETH_HELD_ADJ=Number(result.BalanceETH)/ETH_Held;
  RS.PWS=Math.max(Math.pow(((Time_Since_Deployment_Max-(RS.DaySinceDeploy)+RS.GasAdj- RS.TransAdj - RS.ETH_HELD_ADJ)/Time_Since_Deployment_Max),5), Price_Floor);
  console.log("RS ---- " , RS);
  if(stakedNXM==0)
  RS.RCWS=Math.max(Math.pow(((Time_Since_Deployment_Max-(RS.DaySinceDeploy)+RS.GasAdj- RS.TransAdj - RS.ETH_HELD_ADJ)/Time_Since_Deployment_Max),5), Price_Floor);
  else
  RS.RCWS=Math.max(Math.pow(((Time_Since_Deployment_Max-(RS.DaySinceDeploy )+ RS.GasAdj- RS.TransAdj - RS.ETH_HELD_ADJ -stakedNXM/Days_reduction_NXM)/Time_Since_Deployment_Max),5),Price_Floor_with_Staking);
  RS.NYPRW=((Math.pow(Math.min(coverperiod,STLP),2))*STL/STLP+coverperiod)*RS.RCWS*(1+PM)/365.25;
    
  QD.coverCurr=curr;
  QD.coverPeriod=CP;
  QD.smartCA=contr;
  getAllDistinctSCAdd(Version, function(resultSC, errorSC){

    if(errorSC == null){
      if(JSON.parse(resultSC).length == 0)
      {
        relatedContracts = [contr];
        getCurrencies_sign(res,stakedNXM,RS,QD,SA,contr,CP,relatedContracts,avgRate,tokenPriceCurr);
      }
      else
      {
      dBResultDistinctAdd = JSON.parse(resultSC);
      const json2csvParser = new Json2csvParser({ fields });
      const csv = json2csvParser.parse(dBResultDistinctAdd);
      fs.writeFileSync('Nexus_Mutual.csv', csv, 'binary');
      // runScript(contr.toLowerCase(),minCorel)
      // .then(function(fileName) {
        // if (fileName === 9999) {
        //   res.end('Failed');
        // } else {

    // fs.readFile(dir+fileName, function(err, data) {
    // if (err) {
    //   console.log('error:', err);
    //   res.end(err);
    //   return;
    // } else {
    //   console.log("data ",data);
    //   console.log("file name ",dir+fileName);
    //   var relatedContractsCoRel = JSON.parse(data);
    //   console.log("relatedContractsCoRel ",relatedContractsCoRel);
    // for(var i=0;i<relatedContractsCoRel[contr.toLowerCase()].length;i++){
    //  relatedContracts.push(relatedContractsCoRel[contr.toLowerCase()][i].address);
    // }
  	relatedContracts = [contr];
    getCurrencies_sign(res,stakedNXM,RS,QD,SA,contr,CP,relatedContracts,avgRate,tokenPriceCurr);
    // }
  // });
        // };
      // })
      // .catch(console.error());
    }
    }
    else
      {console.log(errorSC);
  	  res.end("Error in Risk cost");
  	}

  });
      
  
  
}

function getCurrencies_sign(res,stakedNXM,RS,QD,SA,contr,CP,relatedContracts,avgRate,tokenPriceCurr){
  var currencies=[];
  poolDataInstance.getAllCurrencies.call(function(error1,result1){
    if(!error1)
    {
        for(i=0;i<result1.length;i++)
        	{
        		currencies.push({name:result1[i]});
        		
        	}
          get3daysAvg_sign(currencies,res,stakedNXM,RS,QD,0,0,SA,contr,CP,relatedContracts,avgRate,tokenPriceCurr);                               
    }
    else
        res.end(error1);
  });
                        
                    
                
};

function get3daysAvg_sign(currencies,res,stakedNXM,RS,QD,index,totalSumAssured,SA,contr,CP,relatedContracts,avgRate,tokenPriceCurr)
{
	poolDataInstance.getCAAvgRate.call(currencies[index].name,function(error1,result1){
		if(!error1)
		{
      var c=0;
      relatedContracts.forEach(function(dataItem, i){
      quotationDataInstance.getTotalSumAssuredSC.call(dataItem,currencies[index].name,function(error2,result2)
		 {
		 	if(!error2)
		 	{
        c++;
		 		totalSumAssured=totalSumAssured+(result2.toNumber()*100)/result1.toNumber();

		 		if(index==currencies.length-1 && c == relatedContracts.length)
		 			{
		 				totalSumAssured	= totalSumAssured	* avgRate;
		 				CapacityLimit_sign(res,stakedNXM,RS,QD,totalSumAssured,SA,CP,tokenPriceCurr);
		 			}
		 		else if(c == relatedContracts.length)
		 			get3daysAvg_sign(currencies,res,stakedNXM,RS,QD,index+1,totalSumAssured,SA,contr,CP,relatedContracts,avgRate,tokenPriceCurr);
		 	}
		 	else
		 	{console.log(error2);
		 	 res.end("Error in 3daysAvg");
		 	}

		 })
  });
		}
		else
		 res.end(error1);
	})
}

function CapacityLimit_sign(res,stakedNXM,RS,QD,totalSumAssured,SA,CP,tokenPriceCurr){
    
     if(RS.PWS==RS.RCWS)
       RS.capacityLimit=999999999999999999;
     else
     RS.capacityLimit=stakedNXM/(RS.PWS-RS.RCWS)*(1+capacityBufferValue);

     if(RS.RCWS>0.5){
      res.end(JSON.stringify({reason:"Uncoverable", coverAmount:0}));
     }
     else{
     
	     RS.CapacityLimitCheck=(RS.PWS * RS.capacityLimit) - (RS.RCWS * RS.capacityLimit + stakedNXM);
	     RS.CapacityLimitGBP=RS.capacityLimit * NXMPriceGBP;
	     RS.CapacityLimitRatio= (RS.CapacityLimitGBP / (stakedNXM*10));
	     RS.EarnLimitNXM=RS.capacityLimit * salesCommision;
	     RS.EarnLimitRatio=( RS.EarnLimitNXM / stakedNXM);
     
     	var capacityLimitInCurr=RS.capacityLimit*tokenPriceCurr;
	     if(Math.min(MCR_Per,capacityLimitInCurr)>=totalSumAssured)
	       RS.minimum=Math.min(MCR_Per,capacityLimitInCurr)-totalSumAssured;
	     else
	       RS.minimum=0;
 
	    QD.coverAmount=Math.round(Math.min(RS.minimum,SA));
	    if(SA > (MCR_Per-totalSumAssured))
	    {
	      QD.reason = "MCRExceed";
	    }
	    else if(SA > (capacityLimitInCurr-totalSumAssured))
	    {
	      QD.reason = "capacityLimitExceed";
	    }
	    else 
	    {
	      QD.reason = "ok"; 
	    }
	     console.log("before premium calculations"+ STLP +" "+STL+ " " +CP+ " " +RS.RCWS+ " " +QD.coverAmount+ " " +PM);
	     RS.Premium=((Math.pow(Math.max(STLP-CP,0)/STLP,2))*STL*CP+CP)*RS.RCWS*QD.coverAmount*(1+PM)/365.25;
	     RS.Premium = parseFloat(RS.Premium.toFixed(12));
	     QD.expireTime=Math.floor(Date.now() / 1000)+expireTimeForRequestedCover;
       	 QD.generationTime=Math.floor(Date.now() / 1);
	     QD.coverCurrPrice= Math.round(RS.Premium*1e16);
	     QD.coverCurrPrice*=100;        //To avoid uneven rounding off problem in js
	     console.log("premiuim--->>>",RS.Premium,QD.coverCurrPrice);
	     QD.PriceNxm=Math.round(QD.coverCurrPrice/tokenPriceCurr);
	     console.log('tokenprice---->',tokenPriceCurr);
	     QD.PriceNxm = QD.PriceNxm.toLocaleString();
	     QD.PriceNxm = QD.PriceNxm.replace(/,/g, '');
      console.log("QD--->>>"+JSON.stringify(QD));
	     console.log("RS--->>>"+JSON.stringify(RS));


     	 getVRS(res,QD,RS);

 	}  
}

var MCR_Per;
function getMCRData_sign(res,curr,contr,CP,SA,Version)
{
  var avgRate;
  var tokenPriceCurr;


	avgRate=poolDataInstance.getCAAvgRate(curr)/100;

	poolDataInstance.getLastMCREther(function(error1,result1)
	{
	  if(!error1)
	  {
	    mcrInstance.calculateTokenPrice(curr, function(error2,result2)
	    {
	      if(!error2)
	      {
	        tokenPriceCurr = Math.round(result2.toNumber()/1e14)/1e4;
	        getTokenData_sign(res,contr,CP,SA,curr,avgRate,tokenPriceCurr,Version);
	      }
	      else
	      {
	        console.log(error2);
	        res.end("Error in calculateTokenPrice-->"+error2);
	      }
	    });                  
	    var _MCR=Math.round(result1.toNumber())/1e18;
	    MCR_Per=(_MCR/10)*avgRate;
	    console.log("MCR-->"+_MCR+" MCR_per-->"+MCR_Per);
	  }
	  else
	  {
	    console.log(error1);
	    res.end("Error in getLastMCR-->"+error1);
	  }
	});

}

function getTokenData_sign(res,contr,CP,SA,curr,avgRate,tokenPriceCurr,Version)
{
  var distContract = [];
  var totalGas = 0;

  count.push(0);
  var reqNum = count.length-1;
  var result={};
  result.InternalTx=[];
  var internalTx=[];
  tokenInstance.getTotalStakedTokensOnSmartContract.call(contr,function(error1,result1)
  {
    if(!error1)
    { 
      var stakedNXM=result1.toNumber()/1e18;
      console.log("staked nxm->"+stakedNXM);
      isContract_sign(contr.toLowerCase(),1,{},res,stakedNXM,distContract,CP,SA,totalGas,reqNum,result,internalTx,contr,curr,avgRate,tokenPriceCurr,Version);           
    }
    else
    {
      console.log(error1);
      res.end("Error in getTotalLockedNXMToken-->"+error1);
    }
  });
}

function getABiFiltered_sign(name,abiData)
{
   var ans=abiData.filter(function(n){return n.contractName==name});
   return ans;
}

function getVRS(res,QD,RS)
{

	var order={amount:QD.coverAmount,curr:QD.coverCurr,CP:QD.coverPeriod,smartCA:QD.smartCA,Price:QD.coverCurrPrice,price_nxm:QD.PriceNxm,expire:QD.expireTime,generationTime:QD.generationTime,quotationContract:quotationContractAddress};
    var orderParts = [
           { value: bigNumberToBN(order.amount), type: "uint"},
           { value: order.curr, type: "bytes4" },
           { value: bigNumberToBN(order.CP), type: "uint16" },
           { value: order.smartCA, type: "address" },
           { value: bigNumberToBN(order.Price), type: "uint"},
           { value: bigNumberToBN(order.price_nxm), type: "uint" },
           { value: bigNumberToBN(order.expire), type: "uint" },
           { value: bigNumberToBN(order.generationTime), type: "uint" },
           { value: order.quotationContract, type: "address" },
       ];
        var types = _.map(orderParts, function (o) { return o.type; });
        var values = _.map(orderParts, function (o) { return o.value; });
        var hashBuff = ethABI.soliditySHA3(types, values);
        var hashHex = util.bufferToHex(hashBuff);
        
        console.log("hashHex---->"+hashHex);




		getKeystoreInstance(function (resultKs, errorKs)
		{
			if(resultKs!=null){
				resultKs = JSON.parse(resultKs);


	 	ks = (resultKs[0].instance);
  	ks = wallet.deserialize(ks);
	  // Some methods will require providing the `pwDerivedKey`,
	  // Allowing you to only decrypt private keys on an as-needed basis.
	  // You can generate that value with this convenient method:
	  ks.keyFromPassword(_password, function (err, pwDerivedKey) {
	    if (err) throw err;
	    
	    // generate five new address/private key pairs
	    // the corresponding private keys are also encrypted
	    ks.generateNewAddress(pwDerivedKey, 1);
	    console.log("privatekey---->",ks,' ',pwDerivedKey.toString("hex"));
	    var addr = ks.getAddresses();
	    ks.passwordProvider = function (callback) {
	      var pw = prompt("Please enter password", "Password");
	      callback(null, pw);

	    };

	 
	  const orderHashBuff = util.toBuffer(hashHex);
	  const    msgHashBuff = util.hashPersonalMessage(orderHashBuff);
	  const sig = lightwallet.signing.signMsgHash(ks, pwDerivedKey, msgHashBuff, ks.getAddresses()[0]);
	   
	  console.log(sig.v," ",util.toUnsigned(util.fromSigned(sig.r)).toString('hex'),"  ",util.toUnsigned(util.fromSigned(sig.s)).toString('hex'));

	  const prefix = util.toBuffer("\x19Ethereum Signed Message:\n");
	  const prefixedMsg = util.sha3(
	  Buffer.concat([prefix, util.toBuffer(String(32)), orderHashBuff])
	);
	QD.v=sig.v;
	QD.r="0x"+util.toUnsigned(util.fromSigned(sig.r)).toString('hex');
	QD.s="0x"+util.toUnsigned(util.fromSigned(sig.s)).toString('hex');
    console.log("QD",QD);
	res.end(JSON.stringify(QD));

	 const pubKey  = util.ecrecover(prefixedMsg,sig.v,sig.r,sig.s);
	 const addrBuf = util.pubToAddress(pubKey);
	 const addr1    = util.bufferToHex(addrBuf);

	console.log(ks.getAddresses()[0],  addr1);


   });
  
 }
 else
 {console.log(errorKs); 
 res.end("Error in keystore");
 }  // Now set ks as transaction_signer in the hooked web3 provider
    // and you can start using web3 using the keys/addresses in ks!

});
}

function bigNumberToBN (value) {
  return new BN(value.toString(), 10);
}

async function getAllDistinctSCAdd(version,callback){

  var collectionName = process.env.smartCoverDetailsCollectionName;
  var version = version;
  MongoClient.connect(url,{useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db(process.env.dbName);
    dbo.collection(collectionName)
    .distinct("smartContractAdd", {lockCN: {$gt:0}, statusNum :{$ne:1}, statusNum :{$ne:3}, expirytimeStamp:{$gt:Math.floor(Date.now() / 1000)}, version :version},function(errr,docss){
      if(errr == null){
        var jsonData = [];
        for(let i=0;i<docss.length;i++)
        {
          jsonData[i] = {};
          jsonData[i][fields] = docss[i];
        }
        callback(JSON.stringify(jsonData),null);
      }
      else{
        console.log(`No data found in smartcoverdetailsdatabase for ${version}.`);
        callback(null,JSON.stringify([]));
      }
    })
  });


}

async function getKeystoreInstance(callback){
  var collectionName = process.env.keyStoreCollection;

  console.log(collectionName);
  MongoClient.connect(url,{useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db(process.env.dbName);


        dbo.collection(collectionName).find().toArray(function(err, docs) {
          if (docs.length > 0) {
            db.close();
             callback(JSON.stringify(docs),null);
          }
          else{
            db.close();
            callback(null,JSON.stringify([]));
          }
      });
      

  });
  

}

async function getVersion(callback){
  var collectionName = process.env.versionABIsCollectionName;
  var version = "M1";
  MongoClient.connect(url,{useNewUrlParser:true},function(err,db){
    if(!err){
      var dbo = db.db(process.env.dbName);
      dbo.collection(collectionName).find({"versionType" : version}).toArray(function(errr, docss) {
        if(docss.length>0){
            callback(null,JSON.stringify(docss));
        }
        else{
          console.log(`No current_version found for ${version}`);
          callback(null,JSON.stringify([]));
        }
      });
    }
    else{
      console.log(`MongoClient connection error ${err}`);
      callback(err,null);
    }
  });
}

app.listen(4406, function() {
  mainnetWeb3 = new Web3(new Web3.providers.HttpProvider(process.env.MainnetEndPoint));
  isContractAbi = [{"constant":true,"inputs":[{"name":"_addr","type":"address"}],"name":"isContract","outputs":[{"name":"is_contract","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"}];
  isContractAddress = process.env.isContractAddress;
  isContractContract = mainnetWeb3.eth.contract(isContractAbi);
  isInstance = isContractContract.at(isContractAddress);
  console.log('simple nodejs listening on *:4406');
}); 
