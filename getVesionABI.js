


require('dotenv').config();
var url = process.env.mongodbSever;
var MongoClient = require('mongodb').MongoClient;

async function getVersion(callback){
	var collectionName = process.env.versionABIsCollectionName;
	var version = process.env.version;
	console.log("collectionName "+collectionName);
	console.log("version "+version);
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


module.exports =  {getVersion};