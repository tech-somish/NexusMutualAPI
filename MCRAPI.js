var app = require('express')();
const helmet = require('helmet');

require('dotenv').config();

app.use(helmet());
const Joi = require('joi');
const Json2csvParser = require('json2csv').Parser;
var fs = require('fs');
var Client = require('node-rest-client').Client;
var Web3 = require('web3');
const { runScript } = require('./backend.js');
const dir = './Cosine/';
var tx = require('ethereumjs-tx');

var getVersion = require('./getVesionABI.js').getVersion;
var urlMongo = process.env.mongodbSever;
var MongoClient = require('mongodb').MongoClient;

const WEB3_ENDPOINT = process.env.EndPoint;
var web3 = new Web3(new Web3.providers.HttpProvider(WEB3_ENDPOINT));
const fields = ['address'];
var allCurrencies = [];
var allRates = [];
var ethUpStress = 0.5;
var ethDownStress = 0.5;
var daiUpStress = 0.3;
var daiDownStress = 0.3;
var PM;
var mcrReductionFactor = 0.06;
var disAddMapping = {};
var totalOriginalRisk = 0;
var MCR_PER = 0;
var vFull = 0;
var mcrETH = 0;
var minCap=7000;
var NXMasterAbi = [{"constant":true,"inputs":[],"name":"pauseTime","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"contractsActive","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_toCheck","type":"address"}],"name":"isAuthorizedToGovern","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"emergencyPaused","outputs":[{"name":"pause","type":"bool"},{"name":"time","type":"uint256"},{"name":"by","type":"bytes4"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"tokenAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"masterAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_tokenAdd","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"constant":false,"inputs":[{"name":"_contractsName","type":"bytes2"},{"name":"_contractsAddress","type":"address"}],"name":"upgradeContractImplementation","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"myid","type":"bytes32"}],"name":"delegateCallBack","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"code","type":"bytes8"}],"name":"getAddressParameters","outputs":[{"name":"codeVal","type":"bytes8"},{"name":"val","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"code","type":"bytes8"}],"name":"getOwnerParameters","outputs":[{"name":"codeVal","type":"bytes8"},{"name":"val","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_pause","type":"bool"},{"name":"_by","type":"bytes4"}],"name":"addEmergencyPause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_time","type":"uint256"}],"name":"updatePauseTime","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"masterInitialized","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getPauseTime","outputs":[{"name":"_time","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_contractsName","type":"bytes2"},{"name":"_contractsAddress","type":"address"}],"name":"upgradeContract","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_add","type":"address"}],"name":"isInternal","outputs":[{"name":"check","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_add","type":"address"}],"name":"isOwner","outputs":[{"name":"check","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"isPause","outputs":[{"name":"check","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_add","type":"address"}],"name":"isMember","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"index","type":"uint256"}],"name":"getEmergencyPauseByIndex","outputs":[{"name":"_index","type":"uint256"},{"name":"_pause","type":"bool"},{"name":"_time","type":"uint256"},{"name":"_by","type":"bytes4"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getEmergencyPausedLength","outputs":[{"name":"len","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getLastEmergencyPause","outputs":[{"name":"_pause","type":"bool"},{"name":"_time","type":"uint256"},{"name":"_by","type":"bytes4"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_masterAddress","type":"address"}],"name":"changeMasterAddress","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getVersionData","outputs":[{"name":"contractsName","type":"bytes2[]"},{"name":"contractsAddress","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"dAppLocker","outputs":[{"name":"_add","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"dAppToken","outputs":[{"name":"_add","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_contractName","type":"bytes2"}],"name":"getLatestAddress","outputs":[{"name":"contractAddress","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_contractAddresses","type":"address[]"}],"name":"addNewVersion","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_add","type":"address"}],"name":"checkIsAuthToGoverned","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"startEmergencyPause","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"code","type":"bytes8"},{"name":"val","type":"address"}],"name":"updateAddressParameters","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"code","type":"bytes8"},{"name":"val","type":"address"}],"name":"updateOwnerParameters","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}];
var NXMasterAddress = process.env.NXMasterAddress;
NXMasterContract = web3.eth.contract(NXMasterAbi);
NXMasterInstance = NXMasterContract.at(NXMasterAddress);
var allContractAddress = [];

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

var daiAbi = [{constant:false,inputs:[{name:'owner_',type:'address'}],name:'setOwner',outputs:[],payable:false,stateMutability:'nonpayable',type:'function'},{constant:false,inputs:[],name:'poke',outputs:[],payable:false,stateMutability:'nonpayable',type:'function'},{constant:true,inputs:[],name:'compute',outputs:[{name:'',type:'bytes32'},{name:'',type:'bool'}],payable:false,stateMutability:'view',type:'function'},{constant:false,inputs:[{name:'wat',type:'address'}],name:'set',outputs:[],payable:false,stateMutability:'nonpayable',type:'function'},{constant:false,inputs:[{name:'wat',type:'address'}],name:'unset',outputs:[],payable:false,stateMutability:'nonpayable',type:'function'},{constant:true,inputs:[{name:'',type:'address'}],name:'indexes',outputs:[{name:'',type:'bytes12'}],payable:false,stateMutability:'view',type:'function'},{constant:true,inputs:[],name:'next',outputs:[{name:'',type:'bytes12'}],payable:false,stateMutability:'view',type:'function'},{constant:true,inputs:[],name:'read',outputs:[{name:'',type:'bytes32'}],payable:false,stateMutability:'view',type:'function'},{constant:true,inputs:[],name:'peek',outputs:[{name:'',type:'bytes32'},{name:'',type:'bool'}],payable:false,stateMutability:'view',type:'function'},{constant:true,inputs:[{name:'',type:'bytes12'}],name:'values',outputs:[{name:'',type:'address'}],payable:false,stateMutability:'view',type:'function'},{constant:false,inputs:[{name:'min_',type:'uint96'}],name:'setMin',outputs:[],payable:false,stateMutability:'nonpayable',type:'function'},{constant:false,inputs:[{name:'authority_',type:'address'}],name:'setAuthority',outputs:[],payable:false,stateMutability:'nonpayable',type:'function'},{constant:true,inputs:[],name:'owner',outputs:[{name:'',type:'address'}],payable:false,stateMutability:'view',type:'function'},{constant:false,inputs:[],name:'void',outputs:[],payable:false,stateMutability:'nonpayable',type:'function'},{constant:true,inputs:[],name:'has',outputs:[{name:'',type:'bool'}],payable:false,stateMutability:'view',type:'function'},{constant:false,inputs:[{name:'pos',type:'bytes12'},{name:'wat',type:'address'}],name:'set',outputs:[],payable:false,stateMutability:'nonpayable',type:'function'},{constant:true,inputs:[],name:'authority',outputs:[{name:'',type:'address'}],payable:false,stateMutability:'view',type:'function'},{constant:false,inputs:[{name:'pos',type:'bytes12'}],name:'unset',outputs:[],payable:false,stateMutability:'nonpayable',type:'function'},{constant:false,inputs:[{name:'next_',type:'bytes12'}],name:'setNext',outputs:[],payable:false,stateMutability:'nonpayable',type:'function'},{constant:true,inputs:[],name:'min',outputs:[{name:'',type:'uint96'}],payable:false,stateMutability:'view',type:'function'},{anonymous:false,inputs:[{indexed:false,name:'val',type:'bytes32'}],name:'LogValue',type:'event'},{anonymous:true,inputs:[{indexed:true,name:'sig',type:'bytes4'},{indexed:true,name:'guy',type:'address'},{indexed:true,name:'foo',type:'bytes32'},{indexed:true,name:'bar',type:'bytes32'},{indexed:false,name:'wad',type:'uint256'},{indexed:false,name:'fax',type:'bytes'}],name:'LogNote',type:'event'},{anonymous:false,inputs:[{indexed:true,name:'authority',type:'address'}],name:'LogSetAuthority',type:'event'},{anonymous:false,inputs:[{indexed:true,name:'owner',type:'address'}],name:'LogSetOwner',type:'event'}];

daiContractAddress = process.env.daiFeedAddress;
daiContract = web3.eth.contract(daiAbi);
daiInstance = daiContract.at(daiContractAddress);
var args = {
    "headers": {
        "x-api-key": process.env.apiKey,
        "cache-control": "no-cache"
    } // request headers
    };
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});
app.get('/MCRAPI/:Version', function(req, res) {

  Version = req.params.Version.toString();
  const versionSchema = {
    a: Joi.string()
      .alphanum()
      .length(2)
  };
  const { error, value } = Joi.validate({ a: Version }, versionSchema);
  if (error != null) {
    res.send('NOTOK');
  } else {
    staticStressMatrix = {};
    sumAssuaredData = [];
    dBResultAllCover = [];
    coRel = [];
    baseSAPairs = [];
    saETHStressUpPairs = [];
    saETHStressDownPairs = [];
    saCAStressUpPairs = [];
    saCAStressDownPairs = [];
    MCRCap = {
      baseSA: 0,
      saETHStressUp: 0,
      saETHStressDown: 0,
      saCAStressUp: 0,
      saCAStressDown: 0
    };
    var MCRScenario = {
      PoolFund: {},
      SolvencyCapital: {},
      BestEstimateLiability: {},
      CapitalisationRatio: {}
    };
    totalOriginalRisk = 0;
    web3 = new Web3();
    web3.setProvider(
      new Web3.providers.HttpProvider(WEB3_ENDPOINT)
    );


    getVersion(function(errData, data) {
      abiData = JSON.parse(data);
      if (abiData.length != 0) {
        var filteredAbi = getABiFiltered_sign('pool1');
        pool1ContractAddress = allContractAddress[filteredAbi[0].smartContractCode];

        var filteredAbi = getABiFiltered_sign('pool2');
        pool2ContractAddress = allContractAddress[filteredAbi[0].smartContractCode];


        var filteredAbi = getABiFiltered_sign('poolData');
        poolDataAbi = JSON.parse(filteredAbi[0].contractAbi);
        poolDataContractAddress = allContractAddress[filteredAbi[0].smartContractCode];
        poolDataContract = web3.eth.contract(poolDataAbi);
        poolDataInstance = poolDataContract.at(poolDataContractAddress);

        var filteredAbi = getABiFiltered_sign('dai');
        daiCAAbi = JSON.parse(filteredAbi[0].contractAbi);
        daiCAContractAddress = poolDataInstance.getCurrencyAssetAddress("DAI");
        daiCAContract = web3.eth.contract(daiCAAbi);
        daiCAInstance = daiCAContract.at(daiCAContractAddress);

        var filteredAbi = getABiFiltered_sign('quotationData');
        quotationDataAbi = JSON.parse(filteredAbi[0].contractAbi);
        quotationDataContractAddress = allContractAddress[filteredAbi[0].smartContractCode];
        quotationDataContract = web3.eth.contract(quotationDataAbi);
        quotationDataInstance = quotationDataContract.at(quotationDataContractAddress);


        allCurrencies = [];

        allCurrencies = poolDataInstance.getAllCurrencies();

        PM = (quotationDataInstance.pm())/100;


        for (var i = 0; i < allCurrencies.length; i++) {
          allCurrencies[i] = hex_to_ascii(allCurrencies[i]);
          staticStressMatrix[allCurrencies[i]] = {};
        }
        getDistinctScAdd(res);
      } else {
        res.send('NOTOkkK');
      }
    });
  }
});

app.get('/allDistinctSCAdd/:Version', function(req, res) {
  Version = req.params.Version.toString();
  const versionSchema = {
    a: Joi.string()
      .alphanum()
      .length(2)
  };
  const { error, value } = Joi.validate({ a: Version }, versionSchema);
  if (error != null) {
    res.send('NOTOK');
  } else {
    getAllDistCons(function(err,dBResultDistinctAdd)
    {
      dBResultDistinctAdd  = JSON.parse(dBResultDistinctAdd);
      var dBResultDistinctAddJSONArr = [];
    for(var i =0;i<dBResultDistinctAdd.length;i++)
    {
      dBResultDistinctAddJSONArr.push({"address":dBResultDistinctAdd[i]["address"].toLowerCase()});
    }
    const json2csvParser = new Json2csvParser({ fields });
    const csv = json2csvParser.parse(dBResultDistinctAddJSONArr);
    fs.writeFileSync('Nexus_Mutual.csv', csv, 'binary');
    dBResultDistinctAdd = dBResultDistinctAddJSONArr;
    res.send(dBResultDistinctAdd);
    });
    
  }
});

app.get('/allCoverDetails/:Version', function(req, res) {
  Version = req.params.Version.toString();
  const versionSchema = {
    a: Joi.string()
      .alphanum()
      .length(2)
  };
  const { error, value } = Joi.validate({ a: Version }, versionSchema);
  if (error != null) {
    res.send('NOTOK');
  } else {
    getAllCoverData(function(errData,coverData){

    res.send(JSON.parse(coverData));
    });
  }
});

app.get('/computeCoRel/', function(req, res) {
  runScript()
    .then(function(fileName) {
      if (fileName === 9999) {
        res.send('MCR failed');
      } else {
        fn = {};
        fn['name'] = fileName;
        res.send(fn);
      }
    })
    .catch(console.error());
});

app.get('/readCoRel/:fileName', function(req, res) {
  var url = req.url;

  var params = url.substring(10, url.length);

  var param = params.split('/');

  fileName = dir + param[1];

  fs.readFile(fileName, function(err, data) {
    if (err) {
      res.send(err, '  ', data);
      console.log('error:', err);
      return;
    } else {
      res.send(JSON.parse(data));
    }
  });
});

/// @dev Gets all distinct SC addresses covered so far and converts it in csv file.
function getDistinctScAdd(res) {
  var urlDistinctAdd = 'http://localhost:4401/allDistinctSCAdd/' + Version;
  var client = new Client();
  client.registerMethod('jsonMethod', urlDistinctAdd, 'GET');
  client.methods.jsonMethod(function(data, response) {
    dBResultDistinctAdd = data;
    getStressUpDown(res);
  });
}

/// @dev Gets matrix for stress Up/Down values for all currencies.
function getStressUpDown(res) {
  daiInstance.read.call(function(error1, result1) {
    if (!error1) {
      var usdRate = parseInt(result1, 16) / 1e18;
      
      for (var i = 0; i < allCurrencies.length; i++) {
        if (allCurrencies[i] != 'ETH') {
          allRates[i] = usdRate * 100;
          staticStressMatrix[allCurrencies[i]]['baseCase'] = 1 / usdRate;
          staticStressMatrix[allCurrencies[i]]['ethStressUP'] =
            staticStressMatrix[allCurrencies[i]].baseCase / (1 + ethUpStress);
          staticStressMatrix[allCurrencies[i]]['ethStressDown'] =
            staticStressMatrix[allCurrencies[i]].baseCase / (1 - ethDownStress);
          staticStressMatrix[allCurrencies[i]]['daiStressUP'] =
            staticStressMatrix[allCurrencies[i]].baseCase * (1 + daiUpStress);
          staticStressMatrix[allCurrencies[i]]['daiStressDown'] =
            staticStressMatrix[allCurrencies[i]].baseCase * (1 - daiDownStress);
        } else {
          allRates[i] = 100;
          staticStressMatrix.ETH['baseCase'] = 1;
          staticStressMatrix.ETH['ethStressUP'] = 1;
          staticStressMatrix.ETH['ethStressDown'] = 1;
          staticStressMatrix.ETH['daiStressUP'] = 1;
          staticStressMatrix.ETH['daiStressDown'] = 1;
        }
      }
      getAllCoverDetails(res);
    } else console.error(error1);
  });
}

var dBResultAllCover = [];
var coRel = [];
/// @dev Gets data related to all Covers and computes sumAssured for all currencies and stress values
/// @dev running R code on csv generated above and will generate cosine matrix and returns the name of that file
function getAllCoverDetails(res) {
  var urlAllCover = 'http://localhost:4401/allCoverDetails/' + Version;
  var client = new Client();
  client.registerMethod('jsonMethod', urlAllCover, 'GET');
  client.methods.jsonMethod(function(data, response) {
    dBResultAllCover = data;
    if(dBResultAllCover.length > 0) {
    for (var i = 0; i < dBResultAllCover.length; i++) {
      obj = {};
      obj.riskCost =
        ((dBResultAllCover[i].premium / 1e18) *
          staticStressMatrix[dBResultAllCover[i].curr].baseCase) /
        (1 + PM);
      totalOriginalRisk += obj.riskCost;
      obj.baseSAInETH =
        dBResultAllCover[i].sumAssured *
        staticStressMatrix[dBResultAllCover[i].curr].baseCase;
      obj.SAEthStressUp =
        dBResultAllCover[i].sumAssured *
        staticStressMatrix[dBResultAllCover[i].curr].ethStressUP;
      obj.SAEthStressDown =
        dBResultAllCover[i].sumAssured *
        staticStressMatrix[dBResultAllCover[i].curr].ethStressDown;
      obj.SADAIStressUP =
        dBResultAllCover[i].sumAssured *
        staticStressMatrix[dBResultAllCover[i].curr].daiStressUP;
      obj.SADAIStressDown =
        dBResultAllCover[i].sumAssured *
        staticStressMatrix[dBResultAllCover[i].curr].daiStressDown;
      sumAssuaredData.push(obj);

    }
  
    console.log("sumAssuaredData",sumAssuaredData);
    // var urlComputeCoRel = 'http://localhost:4401/computeCoRel';
    // var clientComputeCoRel = new Client();
    // clientComputeCoRel.registerMethod('jsonMethod', urlComputeCoRel, 'GET');
    // clientComputeCoRel.methods.jsonMethod(function(data1, response1) {
    //   var fileName = data1;

    //   if (fileName === 9999) {
    //     res.send('MCR failed');
    //   } else {
        // computeCoRelMatrix(res, fileName['name']);
        computeCoRelMatrix(res, "");
    //   }
    // });
  }
  else
  {
    poolDataInstance.minCap( function(error1, result1) {
      if(!error1){
        result1 = result1 * 1e21;
        console.log("MIN CAP" + result1);
        MCRCap['baseSA'] = result1/1e18;
        MCRCap['saETHStressUp'] = result1/1e18;
        MCRCap['saETHStressDown'] = result1/1e18;
        MCRCap['saCAStressUp'] = result1/1e18;
        MCRCap['saCAStressDown'] = result1/1e18;
        getMCRScenario(res);

      }
      else res.end("NOT OK in getAllCoverDetails");
    });
    
  }
  });
}

/// @dev reading the file generated above.
/// @dev mapping the addresses to index.(R file is not returning result in same order as we provided in csv).
/// @dev generating matrix which consist of co-realation values for all possible pairs of covers.
/// @param fileName name of file that genarated by R code.
function computeCoRelMatrix(res, fileName) {
  // var urlReadCoRel = 'http://localhost:4401/readCoRel/' + fileName;
  // var clientComputeCoRel = new Client();
  // clientComputeCoRel.registerMethod('jsonMethod', urlReadCoRel, 'GET');
  // clientComputeCoRel.methods.jsonMethod(function(data, response) {
    // var cosineMatrix = data;
    var cosineMatrix={};
    for(var k =0;k<dBResultDistinctAdd.length;k++)
    {
      for(var ik=0;ik<dBResultDistinctAdd.length;ik++)
      {

        var value = 0.5;
        if(dBResultDistinctAdd[k].address==dBResultDistinctAdd[ik].address){
          value = 1;
        }
        if(cosineMatrix[dBResultDistinctAdd[k].address]==undefined)
          cosineMatrix[dBResultDistinctAdd[k].address] = {};
        cosineMatrix[dBResultDistinctAdd[k].address][ik] = {};
        cosineMatrix[dBResultDistinctAdd[k].address][ik]["address"] = dBResultDistinctAdd[ik].address;
        cosineMatrix[dBResultDistinctAdd[k].address][ik]["values"] = value;

      }
    }
    for (var i = 0; i < dBResultDistinctAdd.length; i++) {
      disAddMapping[
        cosineMatrix[dBResultDistinctAdd[0].address][i].address
      ] = i;
    }

    for (var j = 0; j < dBResultAllCover.length; j++) {
      obj = [];
      for (var k = 0; k < dBResultAllCover.length; k++) {
        addressJ = dBResultAllCover[j].smartContractAdd.toLowerCase();
        addressK = dBResultAllCover[k].smartContractAdd.toLowerCase();
        obj.push(cosineMatrix[addressJ][disAddMapping[addressK]].values);
      }
      coRel.push(obj);
    }
    console.log("coRel",coRel);
    getSumassuredPairs(res);
  // });
}
var baseSAPairs = [];
var saETHStressUpPairs = [];
var saETHStressDownPairs = [];
var saCAStressUpPairs = [];
var saCAStressDownPairs = [];
/// @dev computing sumAssured A * sumAssured B for all pairs of cover and for all type of stress,currencies.
function getSumassuredPairs(res) {
  for (var i = 0; i < dBResultAllCover.length; i++) {
    objBase = [];
    objETHStressUp = [];
    objETHStressDown = [];
    objDAIStressUp = [];
    objDAIStressDown = [];
    for (var j = 0; j < dBResultAllCover.length; j++) {
      objBase.push(
        sumAssuaredData[i].baseSAInETH * sumAssuaredData[j].baseSAInETH
      );
      objETHStressUp.push(
        sumAssuaredData[i].SAEthStressUp * sumAssuaredData[j].SAEthStressUp
      );
      objETHStressDown.push(
        sumAssuaredData[i].SAEthStressDown * sumAssuaredData[j].SAEthStressDown
      );
      objDAIStressUp.push(
        sumAssuaredData[i].SADAIStressUP * sumAssuaredData[j].SADAIStressUP
      );
      objDAIStressDown.push(
        sumAssuaredData[i].SADAIStressDown * sumAssuaredData[j].SADAIStressDown
      );
    }
    baseSAPairs.push(objBase);
    saETHStressUpPairs.push(objETHStressUp);
    saETHStressDownPairs.push(objETHStressDown);
    saCAStressUpPairs.push(objDAIStressUp);
    saCAStressDownPairs.push(objDAIStressDown);
    // console.log("baseSAPairs",baseSAPairs);
    // console.log("saETHStressUpPairs",saETHStressUpPairs);
    // console.log("saETHStressDownPairs",saETHStressDownPairs);
    // console.log("saCAStressUpPairs",saCAStressUpPairs);
    // console.log("saCAStressDownPairs",saCAStressDownPairs);
  }

  getMCRCapital(res);
}
var MCRCap = {
  baseSA: 0,
  saETHStressUp: 0,
  saETHStressDown: 0,
  saCAStressUp: 0,
  saCAStressDown: 0
};
var MCRScenario = {
  PoolFund: {},
  SolvencyCapital: {},
  BestEstimateLiability: {},
  CapitalisationRatio: {}
};
/// @dev computing MCR capital for each stress scenario.
function getMCRCapital(res) {
  for (var i = 0; i < dBResultAllCover.length; i++) {
    for (var j = 0; j < dBResultAllCover.length; j++) {
      MCRCap['baseSA'] += baseSAPairs[i][j] * coRel[i][j];
      MCRCap['saETHStressUp'] += saETHStressUpPairs[i][j] * coRel[i][j];
      MCRCap['saETHStressDown'] += saETHStressDownPairs[i][j] * coRel[i][j];
      MCRCap['saCAStressUp'] += saCAStressUpPairs[i][j] * coRel[i][j];
      MCRCap['saCAStressDown'] += saCAStressDownPairs[i][j] * coRel[i][j];
    }
  }
  MCRCap['baseSA'] = Math.max(Math.sqrt(MCRCap['baseSA']) * mcrReductionFactor,minCap);
  MCRCap['saETHStressUp'] =
    Math.max(Math.sqrt(MCRCap['saETHStressUp']) * mcrReductionFactor,minCap);
  MCRCap['saETHStressDown'] =
    Math.max(Math.sqrt(MCRCap['saETHStressDown']) * mcrReductionFactor,minCap);
  MCRCap['saCAStressUp'] =
    Math.max(Math.sqrt(MCRCap['saCAStressUp']) * mcrReductionFactor,minCap);
  MCRCap['saCAStressDown'] =
    Math.max(Math.sqrt(MCRCap['saCAStressDown']) * mcrReductionFactor,minCap);
   console.log("MCRCap",MCRCap); 
  getMCRScenario(res);
}

/// @dev computing MCR values to be posted.
function getMCRScenario(res) {
  daiCAInstance.balanceOf(pool1ContractAddress, function(error1, result1) {
    if (!error1) {
      daiCAInstance.balanceOf(pool2ContractAddress, function(error2, result2) {
        if (!error2) {
          MCRScenario['PoolFund'].baseCaseEth =
            web3.eth.getBalance(pool1ContractAddress) / 1e18 +
            web3.eth.getBalance(pool2ContractAddress) / 1e18 +
            (result1 / 1e18) * staticStressMatrix.DAI['baseCase'] +
            (result2 / 1e18) * staticStressMatrix.DAI['baseCase'];
          MCRScenario['SolvencyCapital'].baseCaseEth = MCRCap['baseSA'];
          MCRScenario['BestEstimateLiability'].baseCaseEth = totalOriginalRisk;
          MCRScenario['CapitalisationRatio'].baseCaseEth =
            MCRScenario['PoolFund'].baseCaseEth /
            (MCRScenario['SolvencyCapital'].baseCaseEth +
              MCRScenario['BestEstimateLiability'].baseCaseEth);

          MCRScenario['PoolFund'].ethStressUP =
            web3.eth.getBalance(pool1ContractAddress) / 1e18 +
            web3.eth.getBalance(pool2ContractAddress) / 1e18 +
            (result1 / 1e18) * staticStressMatrix.DAI['ethStressUP'] +
            (result2 / 1e18) * staticStressMatrix.DAI['ethStressUP'];
          MCRScenario['SolvencyCapital'].ethStressUP = MCRCap['saETHStressUp'];
          MCRScenario['BestEstimateLiability'].ethStressUP = totalOriginalRisk;
          MCRScenario['CapitalisationRatio'].ethStressUP =
            MCRScenario['PoolFund'].ethStressUP /
            (MCRScenario['SolvencyCapital'].ethStressUP +
              MCRScenario['BestEstimateLiability'].ethStressUP);

          MCRScenario['PoolFund'].ethStressDown =
            web3.eth.getBalance(pool1ContractAddress) / 1e18 +
            web3.eth.getBalance(pool2ContractAddress) / 1e18 +
            (result1 / 1e18) * staticStressMatrix.DAI['ethStressDown'] +
            (result2 / 1e18) * staticStressMatrix.DAI['ethStressDown'];
            
          MCRScenario['SolvencyCapital'].ethStressDown =
            MCRCap['saETHStressDown'];
          MCRScenario[
            'BestEstimateLiability'
          ].ethStressDown = totalOriginalRisk;
          MCRScenario['CapitalisationRatio'].ethStressDown =
            MCRScenario['PoolFund'].ethStressDown /
            (MCRScenario['SolvencyCapital'].ethStressDown +
              MCRScenario['BestEstimateLiability'].ethStressDown);

          MCRScenario['PoolFund'].daiStressUP =
            web3.eth.getBalance(pool1ContractAddress) / 1e18 +
            web3.eth.getBalance(pool2ContractAddress) / 1e18 +
            (result1 / 1e18) * staticStressMatrix.DAI['daiStressUP'] +
            (result2 / 1e18) * staticStressMatrix.DAI['daiStressUP'];
            
          MCRScenario['SolvencyCapital'].daiStressUP = MCRCap['saCAStressUp'];
          MCRScenario['BestEstimateLiability'].daiStressUP = totalOriginalRisk;
          MCRScenario['CapitalisationRatio'].daiStressUP =
            MCRScenario['PoolFund'].daiStressUP /
            (MCRScenario['SolvencyCapital'].daiStressUP +
              MCRScenario['BestEstimateLiability'].daiStressUP);

          MCRScenario['PoolFund'].daiStressDown =
            web3.eth.getBalance(pool1ContractAddress) / 1e18 +
            web3.eth.getBalance(pool2ContractAddress) / 1e18 +
            (result1 / 1e18) * staticStressMatrix.DAI['daiStressDown'] +
            (result2 / 1e18) * staticStressMatrix.DAI['daiStressDown'];
            
          MCRScenario['SolvencyCapital'].daiStressDown =
            MCRCap['saCAStressDown'];
          MCRScenario[
            'BestEstimateLiability'
          ].daiStressDown = totalOriginalRisk;
          MCRScenario['CapitalisationRatio'].daiStressDown =
            MCRScenario['PoolFund'].daiStressDown /
            (MCRScenario['SolvencyCapital'].daiStressDown +
              MCRScenario['BestEstimateLiability'].daiStressDown);
          MCR_PER = Math.min(
            MCRScenario['CapitalisationRatio'].baseCaseEth,
            MCRScenario['CapitalisationRatio'].ethStressUP,
            MCRScenario['CapitalisationRatio'].ethStressDown,
            MCRScenario['CapitalisationRatio'].daiStressUP,
            MCRScenario['CapitalisationRatio'].daiStressDown
          );

          console.log("MCRScenario",MCRScenario);
          vFull = MCRScenario['PoolFund'].baseCaseEth;
          mcrETH = (vFull / MCR_PER) * 100;
          MCR_PER *= 10000;
          if (Version != 'K3') {
            vFull *= 1e18;
            mcrETH *= 1e16;
          }
          console.log('MCR_PER', MCR_PER);
          console.log('vFull', vFull);
          console.log('mcrETH', mcrETH);
          console.log(allRates);
          console.log(allCurrencies);
          var datePosted = formatDate(new Date());
          console.log(datePosted);
          var mcrData = {};
          mcrData.MCR_PER = MCR_PER;
          mcrData.vFull = vFull;
          mcrData.mcrETH = mcrETH;
          mcrData.allRates = allRates;
          mcrData.allCurrencies = allCurrencies;
          mcrData.datePosted = datePosted;
          res.send(mcrData);

          
        }
      });
    }
  });
}



function formatDate(date) {
  var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('');
}

function getABiFiltered_sign(name) {
  var ans = abiData.filter(function(n) {
    return n.contractName == name;
  });

  return ans;

}

async function getAllDistCons(callback){
  var collectionName = process.env.smartCoverDetailsCollectionName;
  var version = "M1"; // process.env.version;
  MongoClient.connect(urlMongo,{useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db(process.env.dbName);
    dbo.collection(collectionName)
    .distinct("smartContractAdd", {lockCN: {$gt:0}, statusNum :{$ne:1}, statusNum :{$ne:3}, expirytimeStamp:{$gt:Math.floor(Date.now() / 1000)}, version :version},function(errr,docss){
      if(docss.length>0){
        var jsonData = [];
            for(let i=0;i<docss.length;i++)
            {
              jsonData[i] = {};
              jsonData[i]["address"] = docss[i];
            }
        callback(null,JSON.stringify(jsonData));
      }
      else{
        callback(null,JSON.stringify([]));
      }
    })
  });
}

async function getAllCoverData(callback)
{
  var collectionName = process.env.smartCoverDetailsCollectionName;
  var version = "M1"; // process.env.version;
  MongoClient.connect(urlMongo,{useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db(process.env.dbName);
    dbo.collection(collectionName)
    .find({
      $and : [{version :version},{ $and :[{lockCN: {$gt:0}},{$and : [{expirytimeStamp:{$gt:Math.floor(Date.now() / 1000)}},{$and:[{statusNum :{$ne:1}},{statusNum :{$ne:3}}]}]}]}]
    }).toArray(function(errr,docss){
      if(docss.length>0){
        callback(null,JSON.stringify(docss));
      }
      else{
        callback(null,JSON.stringify([]));
      }
    })
  });
}

function hex_to_ascii(str1) {
  var hex = str1.toString();
  var str = '';
  for (var n = 0; n < hex.length; n += 2) {
    str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
  }
  var str1 = '';
  for (i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) != 0) {
      str1 += str[i];
    }
  }
  return str1;
}

server = app.listen(4401, function() {
  console.log('MCRAPI.js running on *:4401');
  NXMasterInstance.getVersionData( function(error1, result1) {
    if(error1 == null){
      for(let i = 0;i<result1[0].length;i++)
      allContractAddress[hex_to_ascii(result1[0][i])] = result1[1][i];
  }
    });


});

server.timeout = 0;
