var app = require('express')();
const helmet = require('helmet');

require('dotenv').config();

app.use(helmet());
var http = require('http').Server(app);
var MongoClient = require('mongodb').MongoClient;
var Web3 = require('web3');
var fs = require('fs');
var request = require('request');
var dBResult = '';
var allAbis = [];
var allAddresses = [];
var contractInstanceQD = '';
var contractInstanceTF = '';
var version = "M1"; //process.env.version;
var urlMongo = process.env.mongodbSever;

const WEB3_ENDPOINT = process.env.EndPoint;
var web3 = new Web3(new Web3.providers.HttpProvider(WEB3_ENDPOINT));
var NXMasterAbi = [{"constant":true,"inputs":[],"name":"pauseTime","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"contractsActive","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_toCheck","type":"address"}],"name":"isAuthorizedToGovern","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"emergencyPaused","outputs":[{"name":"pause","type":"bool"},{"name":"time","type":"uint256"},{"name":"by","type":"bytes4"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"tokenAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"masterAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_tokenAdd","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"constant":false,"inputs":[{"name":"_contractsName","type":"bytes2"},{"name":"_contractsAddress","type":"address"}],"name":"upgradeContractImplementation","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"myid","type":"bytes32"}],"name":"delegateCallBack","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"code","type":"bytes8"}],"name":"getAddressParameters","outputs":[{"name":"codeVal","type":"bytes8"},{"name":"val","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"code","type":"bytes8"}],"name":"getOwnerParameters","outputs":[{"name":"codeVal","type":"bytes8"},{"name":"val","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_pause","type":"bool"},{"name":"_by","type":"bytes4"}],"name":"addEmergencyPause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_time","type":"uint256"}],"name":"updatePauseTime","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"masterInitialized","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getPauseTime","outputs":[{"name":"_time","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_contractsName","type":"bytes2"},{"name":"_contractsAddress","type":"address"}],"name":"upgradeContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_add","type":"address"}],"name":"isInternal","outputs":[{"name":"check","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_add","type":"address"}],"name":"isOwner","outputs":[{"name":"check","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"isPause","outputs":[{"name":"check","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_add","type":"address"}],"name":"isMember","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"index","type":"uint256"}],"name":"getEmergencyPauseByIndex","outputs":[{"name":"_index","type":"uint256"},{"name":"_pause","type":"bool"},{"name":"_time","type":"uint256"},{"name":"_by","type":"bytes4"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getEmergencyPausedLength","outputs":[{"name":"len","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getLastEmergencyPause","outputs":[{"name":"_pause","type":"bool"},{"name":"_time","type":"uint256"},{"name":"_by","type":"bytes4"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_masterAddress","type":"address"}],"name":"changeMasterAddress","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getVersionData","outputs":[{"name":"contractsName","type":"bytes2[]"},{"name":"contractsAddress","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"dAppLocker","outputs":[{"name":"_add","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"dAppToken","outputs":[{"name":"_add","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_contractName","type":"bytes2"}],"name":"getLatestAddress","outputs":[{"name":"contractAddress","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_contractAddresses","type":"address[]"}],"name":"addNewVersion","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_add","type":"address"}],"name":"checkIsAuthToGoverned","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"startEmergencyPause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"code","type":"bytes8"},{"name":"val","type":"address"}],"name":"updateAddressParameters","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"code","type":"bytes8"},{"name":"val","type":"address"}],"name":"updateOwnerParameters","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}];
var NXMasterAddress = process.env.NXMasterAddress;
NXMasterContract = web3.eth.contract(NXMasterAbi);
NXMasterInstance = NXMasterContract.at(NXMasterAddress);

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

function callForUpdate(coverId, statusNum, lockCN, blockNumber, res) {
  var jsonData = {
    coverId: coverId * 1,
    statusNum: statusNum * 1,
    lockCN: lockCN * 1,
    blockNumber: blockNumber * 1,
    version: version
  };
  updateSmartCoverStatus(jsonData, function(errRes, resRes) {
    if (resRes == 1) {
      console.log(`postData successful ${coverId}  ${statusNum}  ${lockCN}`);
      res.end("postData successfull after "+coverId+" "+statusNum+" "+lockCN);
    } else {
      console.log(`postData fails ${coverId}  ${statusNum}  ${lockCN}`);
      res.end("postData fails after closeVote func "+coverId+" "+statusNum+" "+lockCN);
    }
  });
}

function callForUpdateRestart(coverId, statusNum, lockCN, blockNumber, lastRecord) {
  var jsonData = {
    coverId: coverId * 1,
    statusNum: statusNum * 1,
    lockCN: lockCN * 1,
    blockNumber: blockNumber * 1,
    version: version
  };
  updateSmartCoverStatus(jsonData, function(errRes, resRes) {
    if (resRes == 1) {
      console.log(`postData successful ${coverId}  ${statusNum}  ${lockCN}`);
      if(lastRecord)
      {
        runListener();
      }
    } else {
      console.log(`postData fails ${coverId}  ${statusNum}  ${lockCN}`);
    }
  });
}

function postData(url, json, res, callback) {
  request(
    {
      url: url,
      json: true,
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: json
    },
    function(error, response, body) {
      if (error) {
        console.log(error);
        callback(error, false);
      } else {
        console.log('postData Success');
        callback(error, true);
      }
    }
  );
}

/// @dev we can force restart the adding data from particular block number.
/// @param blockNumber block number from which we want force restart.
app.get('/updateFromBlock/:blockNumber', function(req, res) {
  var url = req.url;
  var params = url.substring(16, url.length);
  var param = params.split('/');
  blockNumber = param[1] * 1;

  contractInstanceQD
    .CoverDetailsEvent({}, { fromBlock: blockNumber + 1, toBlock: 'latest' })
    .get(function(error, result) {
      if (result.length > 0) {
        result.sort(function(a, b) {
          return a.blockNumber - b.blockNumber;
        });
        console.log("Event ",result[0]);
        for (var i = 0; i < result.length; i++) {

          var count = getPastRecord(result[i].args.cid);
          if (count[0]['count'] == 0)
            getAllDetailsByCoverId(result[i], result.length - i, blockNumber);
          else{
            console.log(`duplicate record for coverId ${result[i].args.cid}`);
            if(i == result.length-1)
              updateCover(blockNumber);      
          }
        }
      } else {
        updateCover(blockNumber);
        console.log('CoverDetailsEvent => result.length=0');
      }
      res.end("i will take a while to update database");
    });
});

/// @dev updates the status and lockCN.
/// @param coverId cover ID.
/// @param statusNum new status number.
/// @param blockNumber new block number
app.get('/updateCoverDetails/:coverId/:statusNum/:blockNumber', function(req,res) {
  var ENDPOINT = process.env.EndPoint;
  var web3 = new Web3(new Web3.providers.HttpProvider(ENDPOINT));
  var url = req.url;
  var params = url.substring(19, url.length);
  var param = params.split('/');
  coverId = parseInt(param[1], 10);
  statusNum = param[2] * 1;
  blockNumber = param[3];
  var lockCN = 0;
  contractInstanceTF.getLockedCNAgainstCover(coverId, function(error1, res1) {
    if (!error1) {
      lockCN = res1;
      callForUpdate(coverId, statusNum, lockCN, blockNumber, res);
    }
  });

  if (statusNum == 1) {
    addToHackedContracts(coverId, res);
  }
});

function addToHackedContracts(coverId, res) {contractInstanceQD.getCoverDetailsByCoverID1(coverId, function(error,result) {
    var urlPastRecords = process.env.dynamoDBDomain + "checkIsHacked/" + result[2] + '/' + version;
    var XMLHttpPastRecords = new XMLHttpRequest();
    XMLHttpPastRecords.open('GET', urlPastRecords, false);
    XMLHttpPastRecords.setRequestHeader("x-api-key", process.env.apiKey);
    XMLHttpPastRecords.send(null);
    if (XMLHttpPastRecords.responseText != undefined) {
      if (XMLHttpPastRecords.responseText == 'false') {

        var url=process.env.dynamoDBDomain + "addHackedContract";

        var jsonData = {
          referenceBy: 'EventCaller',
          smartContractAdd: result[2],
          version: version
        };
        postData(url, jsonData, res, function(errPostData, resPostData) {
          if (resPostData) {
            console.log('Added hacked contract ' + result[2] + ' sucessfully.');
          } else {
            res.end('Added hacked contract error');
          }
        });
      } else {
        console.log('Duplicate adding hacked contract ' + result[2]);
      }
    }
  });
}
/// @dev adds new cover details.
/// @param scAdd smart contract address.
/// @param sa sum assured.
/// @param expiry expiry time of cover.
/// @param premium premium of cover in selected currency.
/// @param curr currency of cover.
/// @param coverId cover ID of cover.
/// @param blockNumber of event.
app.get('/addCoverDetails/:scAdd/:sa/:expiry/:premium/:premiumNXM/:curr/:coverId/:blockNumber',function(req, res) {
    var url = req.url;
    var params = url.substring(16, url.length);
    var param = params.split('/');
    scAdd = param[1];
    sa = parseFloat(param[2]);
    expiry = param[3] * 1;
    premium = parseFloat(param[4]);
    premiumNXM = parseFloat(param[5]);
    curr = param[6];
    lockCN = premiumNXM / 10;
    coverId = param[7] * 1;
    blockNumber = param[8] * 1;
    var web3 = new Web3(new Web3.providers.HttpProvider(process.env.EndPoint));
    var coverCreation = web3.eth.getBlock(blockNumber);
    var jsonData = {};
    jsonData['smartContractAdd'] = scAdd;
    jsonData['sumAssured'] = sa * 1;
    var d = new Date(expiry * 1000);
    jsonData['expiry'] = new Date(d);
    jsonData['expirytimeStamp'] = Math.floor(jsonData['expiry'] / 1000);
    jsonData['statusNum'] = 0;
    jsonData['premium'] = premium * 1;
    jsonData['curr'] = hex_to_ascii(curr);
    jsonData['lockCN'] = lockCN * 1;
    jsonData['coverId'] = coverId * 1;
    jsonData['blockNumber'] = blockNumber * 1;
    d = new Date(coverCreation.timestamp * 1000);
    jsonData['coverCreation'] = new Date(d);
    jsonData['timestamp'] = Math.floor(jsonData['coverCreation'] / 1000);
    jsonData['version'] = version;

    addSmartCoverDetails(jsonData, function(errPostData, resPostData) {
      if (resPostData) {
        console.log('posted Sucessfully ' +scAdd +' ' +sa +' ' +expiry +' ' +premium);
        res.end('1');
      } else {
        res.end('postData error');
      }
    });
  }
);

function hex_to_ascii(str1) {
  var hex = str1.toString();
  var str = '';
  for (var n = 0; n < hex.length; n += 2) {
    str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
  }
  str1 = '';

  for (var i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) != 0) {
      str1 += str[i];
    }
  }
  return str1;
}

/// @dev updates status and lockCN.
/// @param maxBlockNum last updated block number
function updateCover(maxBlockNum) {
  var jsonB = {};
  var indexVars = [];
  contractInstanceQD
    .CoverStatusEvent({}, { fromBlock: maxBlockNum + 1, toBlock: 'latest' })
    .get(function(error, result) {
      if (result.length > 0) {
          result.sort(function(a, b) {
          return a.blockNumber - b.blockNumber;
        });
        for (var i = 0; i < result.length; i++) {
          result[i].args.cid = result[i].args.cid.toNumber();
          jsonB[result[i].args.cid] = result[i];

          if (indexVars.indexOf(result[i].args.cid) == -1) {
            indexVars.push(result[i].args.cid);
          }
        }

        for (var j = 0; j < Object.keys(jsonB).length; j++) {
          var count = getPastRecord(jsonB[indexVars[j]].args.cid);
          lasteRecord = j == Object.keys(jsonB).length-1;
          if (count[0]['count'] != 0)
            getAllStatusByCoverId(jsonB[indexVars[j]], jsonB, lasteRecord);
          else{
            console.log(
              'no record found with coverId ' + jsonB[indexVars[j]].args.cid
            );
          if(j == Object.keys(jsonB).length-1)
          runListener();
      }
        }
      } else {
        console.log('CoverStatusEvent => result.length=0');
        runListener();
      }
    });
}

/// @dev gets status of cover by coverId.
/// @param data json consist of coverid statusNum and blocknumber.
/// @param jsonB mapped values to avoid wrong sequence.
function getAllStatusByCoverId(data, jsonB, lastRecord) {
  contractInstanceTF.getLockedCNAgainstCover(data.args.cid, function(error1,res1) {
    if (!error1) {
      jsonB[data.args.cid].args['lockCN'] = res1;
      callForUpdateRestart(jsonB[data.args.cid].args['cid'],jsonB[data.args.cid].args['statusNum'],jsonB[data.args.cid].args['lockCN'],data.blockNumber, lastRecord);
    }
  });
}

/// @dev gets number of records DB have with particular coverId.
/// @param coverId coverId of cover.
function getPastRecord(coverId) {
  coverId = parseInt(coverId);
  var urlPastRecords = process.env.smartCoverDetailsDomain + "getCoverByCoverID/" + coverId + '/' + version;


  var XMLHttpPastRecords = new XMLHttpRequest();
  XMLHttpPastRecords.open('GET', urlPastRecords, false);
  XMLHttpPastRecords.setRequestHeader("x-api-key", process.env.apiKey);
  XMLHttpPastRecords.send(null);
  if (XMLHttpPastRecords.responseText != undefined) {
    return JSON.parse(XMLHttpPastRecords.responseText);
  }
}

/// @dev gets details of cover from blockchain.
/// @param data json containg cover details.
/// @param len variable to determine last record.
/// @param maxBlockNum latest block.
function getAllDetailsByCoverId(data, len, maxBlockNum) {
  var web3 = new Web3(new Web3.providers.HttpProvider(process.env.EndPoint));
  contractInstanceQD.getCoverDetailsByCoverID1(data.args.cid, function(error,result) {
    contractInstanceQD.getCoverDetailsByCoverID2(data.args.cid, function(error1,result1) {
      contractInstanceQD.getCoverPremiumNXM(data.args.cid, function(error2,result2) {
        var jsonData = {};
        jsonData['smartContractAdd'] = result[2];
        jsonData['sumAssured'] = result1[2] * 1;
        var d = new Date(result1[4] * 1000);
        jsonData['expiry'] = new Date(d);
        jsonData['expirytimeStamp'] = Math.floor(jsonData['expiry'] / 1000);
        jsonData['statusNum'] = 0;
        jsonData['premium'] = data.args.premium * 1;
        jsonData['curr'] = hex_to_ascii(result[3]);
        jsonData['lockCN'] = result2 / 10;
        jsonData['coverId'] = result[0] * 1;
        jsonData['blockNumber'] = data.blockNumber * 1;
        var coverCreation = web3.eth.getBlock(data.blockNumber);
        d = new Date(coverCreation.timestamp * 1000);
        jsonData['coverCreation'] = new Date(d);
        jsonData['timestamp'] = Math.floor(jsonData['coverCreation'] / 1000),
        jsonData['version'] = version;
        if (result1[1] == 1) {
          addToHackedContracts(jsonData['coverId']);
        }

        post(jsonData, len, maxBlockNum);
      });
    });
  });
}

function post(jsonData, len, maxBlockNum) {
  addSmartCoverDetails(jsonData, function(errPostData, resPostData) {
    if (resPostData) {
      console.log('posted Sucessfully ', jsonData);
    } else {
      console.log('postData error');
    }
    if (len == 1) {
      updateCover(maxBlockNum);
    }
  });
}

async function addSmartCoverDetails(jsonData, callback){
  var collectionName = process.env.smartCoverDetailsCollectionName;
  MongoClient.connect(urlMongo,{useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db(process.env.dbName);
    var dataToPost = jsonData;
      dbo.collection(collectionName).insertOne(dataToPost, function(error, result) {
        if (error){
          console.log(`Failed to add details for ${dataToPost.smartContractAdd} of ${dataToPost.version} to smartcoverdetails database.`);
          db.close();
          callback(null, false);
        }
        else{
          console.log(`Smart cover details added for ${dataToPost.smartContractAdd} of ${dataToPost.version} created on ${dataToPost.coverCreation} to smartcoverdetails database.`);
          db.close();
          callback(null, true);
        }
      });
  });
}

async function updateSmartCoverStatus(jsonData, callback){
  var collectionName = process.env.smartCoverDetailsCollectionName;
  MongoClient.connect(urlMongo,{useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db(process.env.dbName);
    var dataToPost = jsonData;
    dbo.collection(collectionName).find({"version":dataToPost.version,"coverId":dataToPost.coverId}).toArray(function(errr, docss) {
      if(docss.length > 0){
        var newvalues = { $set: {lockCN: dataToPost.lockCN,statusNum:dataToPost.statusNum,blockNumber:dataToPost.blockNumber,dateUpdated:new Date().toLocaleString() } };
        dbo.collection(collectionName).updateOne({"version":dataToPost.version,"coverId":dataToPost.coverId},newvalues,function(errr,ress){       
          if (errr) {
            console.log(`Updated smartcontractdetails failed for CoverId : ${dataToPost.coverId}`);
            callback(null, 0);
          }
          else{
            console.log(`Updated smartcontractdetails success for CoverId : ${dataToPost.coverId}`);
            callback(null,1);
          } 
        });
      }
      else{
        console.log(`No record found to update for CoverId : ${dataToPost.coverId}`);
        callback(null, -1);
      }
    });
  });
}

function runListener() {
  var event = contractInstanceQD.allEvents();
  var url;
  event.watch(function(error, result) {
    if (!error) {
      if (result.event == 'CoverDetailsEvent') {

        url = 'http://localhost:6464/addCoverDetails/' + result.args.scAdd + '/' + result.args.sumAssured + '/' + result.args.expiry + '/' + result.args.premium + '/' + result.args.premiumNXM + '/' + result.args.curr + '/' + result.args.cid + '/' + result.blockNumber;
      }
      else if (result.event == 'CoverStatusEvent') {
        url = 'http://localhost:6464/updateCoverDetails/' + result.args.cid + '/' + result.args.statusNum + '/' + result.blockNumber;
      }
      http.get(url).on('error', err => {
        console.log('Error: ' + err.message);
      });
    } else {
      console.log('------->' + error);
    }
  });
}

http.listen(6464, function() {
  console.log('simple nodejs listening on *:6464');
  
  var ENDPOINT = process.env.EndPoint;
  var web3 = new Web3(new Web3.providers.HttpProvider(ENDPOINT));

  var url = process.env.smartCoverDetailsDomain + "versionData/" + version;
  console.log("url",url);


  var XMLHttpABIData = new XMLHttpRequest();
  XMLHttpABIData.open('GET', url, false);
  XMLHttpABIData.setRequestHeader("x-api-key", process.env.apiKey);
  XMLHttpABIData.send(null);
  var allDetails = JSON.parse(XMLHttpABIData.responseText);
  console.log("allDetails",allDetails);
  for (var i = 0; i < allDetails.length; i++) {
      if (allDetails[i].contractName == 'quotationData' || allDetails[i].contractName == 'tokenFunction') {
        allAddresses[allDetails[i].smartContractCode] = NXMasterInstance.getLatestAddress(allDetails[i].smartContractCode);
        allAbis[allDetails[i].smartContractCode] = JSON.parse(allDetails[i].contractAbi);
      }
   }

  contractQD = web3.eth.contract(allAbis['QD']);
  console.log("allAddresses",allAddresses);

  contractInstanceQD = contractQD.at(allAddresses['QD']);
  var contractTF = web3.eth.contract(allAbis['TF']);
  contractInstanceTF = contractTF.at(allAddresses['TF']);
  var url1 = process.env.smartCoverDetailsDomain + "getLatestBlock/" + "M1";

  var XMLHttpBlockNum = new XMLHttpRequest();
  XMLHttpBlockNum.open('GET', url1, false);
  XMLHttpBlockNum.setRequestHeader("x-api-key", process.env.apiKey);
  XMLHttpBlockNum.send(null);

  if (XMLHttpBlockNum.responseText != undefined) {
    dBResult = JSON.parse(XMLHttpBlockNum.responseText);
    var maxBlockNum;
    if(dBResult.length == 0)
      maxBlockNum = 0;
    else
     maxBlockNum = dBResult;
    contractInstanceQD
      .CoverDetailsEvent({}, { fromBlock: maxBlockNum + 1, toBlock: 'latest' })
      .get(function(error, result) {
        if (result.length > 0) {
          result.sort(function(a, b) {
            return a.blockNumber - b.blockNumber;
          });
          for (var i = 0; i < result.length; i++) {
            var count = getPastRecord(result[i].args.cid);
            if (count[0]['count'] == 0)
              getAllDetailsByCoverId(result[i], result.length - i, maxBlockNum);
            else{
              console.log('duplicate record for coverId ' + result[i].args.cid);
              if(i == result.length-1)
                updateCover(maxBlockNum);
            }
          }
        } else {
          updateCover(maxBlockNum);
          console.log('CoverDetailsEvent => result.length=0');
        }
      });
  }


});
