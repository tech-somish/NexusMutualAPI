var express = require('express');
var app = require('express')();
var server1 = require('http').Server(app);
require('dotenv').config();
var http = require('http');
var cors = require('cors')
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var version_K = process.env.Version;
app.use(express.static('dist'))
var fs = require('fs')
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var Web3 = require('web3');
var request = require('request');
var ENDPOINT=process.env.EndPoint;
var web3 = new Web3(new Web3.providers.HttpProvider(ENDPOINT));
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var jsonParser = bodyParser.json({limit: "50mb"});
var extend = require('util')._extend
var url = process.env.mongodbSever;
app.use(cors())

var NXMasterAbi = [{"constant":false,"inputs":[{"name":"_pause","type":"bool"},{"name":"_by","type":"bytes4"}],"name":"addEmergencyPause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_contractAddresses","type":"address[]"}],"name":"addNewVersion","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_masterAddress","type":"address"}],"name":"changeMasterAddress","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"startEmergencyPause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"code","type":"bytes8"},{"name":"val","type":"address"}],"name":"updateAddressParameters","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_time","type":"uint256"}],"name":"updatePauseTime","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_contractsName","type":"bytes2"},{"name":"_contractsAddress","type":"address"}],"name":"upgradeContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_contractsName","type":"bytes2"},{"name":"_contractsAddress","type":"address"}],"name":"upgradeContractImplementation","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_eventCallerAdd","type":"address"},{"name":"_tokenAdd","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"constant":true,"inputs":[{"name":"_add","type":"address"}],"name":"checkIsAuthToGoverned","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"contractsActive","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"dAppLocker","outputs":[{"name":"_add","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"dAppToken","outputs":[{"name":"_add","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"emergencyPaused","outputs":[{"name":"pause","type":"bool"},{"name":"time","type":"uint256"},{"name":"by","type":"bytes4"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"eventCallerAdd","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getCurrentVersion","outputs":[{"name":"versionNo","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"index","type":"uint256"}],"name":"getEmergencyPauseByIndex","outputs":[{"name":"_index","type":"uint256"},{"name":"_pause","type":"bool"},{"name":"_time","type":"uint256"},{"name":"_by","type":"bytes4"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getEmergencyPausedLength","outputs":[{"name":"len","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getEventCallerAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getLastEmergencyPause","outputs":[{"name":"_pause","type":"bool"},{"name":"_time","type":"uint256"},{"name":"_by","type":"bytes4"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_contractName","type":"bytes2"}],"name":"getLatestAddress","outputs":[{"name":"contractAddress","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getPauseTime","outputs":[{"name":"_time","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_versionNo","type":"uint256"}],"name":"getVersionData","outputs":[{"name":"versionNo","type":"uint256"},{"name":"contractsName","type":"bytes2[]"},{"name":"contractsAddress","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_toCheck","type":"address"}],"name":"isAuthorizedToGovern","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_add","type":"address"}],"name":"isInternal","outputs":[{"name":"check","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_add","type":"address"}],"name":"isMember","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_add","type":"address"}],"name":"isOwner","outputs":[{"name":"check","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"isPause","outputs":[{"name":"check","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"masterAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"pauseTime","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"tokenAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"versionDates","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}];
var NXMasterAddress = process.env.masterAddress;

server1.listen(process.env.PORT || 8005, function(){
	console.log('listening on ' + this.address().port);
	backUpURL = "http://localhost:"+this.address().port+"/smartContract_version";

});

//To get latest Block Number
app.get('/getLatestBlock/:version',function(req,res){
	var collectionName = process.env.smartCoverDetailsCollectionName;
	var version = req.params.version;
	MongoClient.connect(url,{useNewUrlParser: true }, function(err, db) {
		if (err) throw err;
		var dbo = db.db(process.env.dbName);
		dbo.collection(collectionName).find({"version":version}).sort({blockNumber:-1}).toArray(function(errr, docss) {
			if(docss.length>0){
				res.end(JSON.stringify(docss[0].blockNumber));
			}
			else{
				console.log(`No Latest Block Number found in smartcoverdetailsdatabase for ${version}.`);
				res.end(JSON.stringify([]));
			}
		});
	});
});

//To get count of coverId for particular version
app.get('/getCoverByCoverID/:coverId/:version',(req,res) => {
	var collectionName = process.env.smartCoverDetailsCollectionName;
	var version = req.params.version;
	var coverId = parseInt(req.params.coverId);
	console.log(version,"  ",coverId);
	MongoClient.connect(url,{useNewUrlParser: true }, function(err, db) {
		if (err) throw err;
		var dbo = db.db(process.env.dbName);
		dbo.collection(collectionName).aggregate(
			[
				{ 
					$match : 
					{
						$and : [{version : version.toString()},{coverId : coverId}]					 
					}
				},
				{
					$count : 'count'
				}
			]
		).toArray(function(errr,docss){
			if(!errr){
				
					res.end(JSON.stringify([{"count":docss.length}]));
			}
			else{
				console.log(`No coverId found in smartcoverdetailsdatabase for ${version}.`);
				res.end(JSON.stringify([{"count":0}]));
			}
		})
	});
});




app.get('/versionData/:version',(req,res) => {
	var collectionName = process.env.versionABIsCollectionName;
	var version = req.params.version;
	console.log("collectionName "+collectionName);
	console.log("version "+version);
	MongoClient.connect(url,{useNewUrlParser:true},function(err,db){
		if(!err){
			var dbo = db.db(process.env.dbName);
			dbo.collection(collectionName).find({"versionType" : version}).toArray(function(errr, docss) {
				if(docss.length>0){
						res.end(JSON.stringify(docss));
				}
				else{
					console.log(`No current_version found for ${version}`);
					res.end(JSON.stringify([]));
				}
			});
		}
		else{
			console.log(`MongoClient connection error ${err}`);
			res.end("0");
		}
	});
});
