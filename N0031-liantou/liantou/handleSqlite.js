var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('./data.db');
var log4js = require('log4js');
log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('./log/jinianri.log'),'jinianri');
var logger = log4js.getLogger('jinianri');

exports.insert = function(data,callback){
	var user_id = data.user_id;
	var timestamp = data.timestamp;
	var heading = data.heading;
	var txhash = data.txhash;
	db.all('select number from times where user_id is "'+user_id+'"',function(err,result){
	     if(!err){
		try{
			var number = JSON.parse(JSON.stringify(result))[0].number;
			}
		catch(e){
			logger.error(e);
			var err = "upload faild!";
			callback(err);
}
		if(!err&&number>0){
			db.run('insert into user (user_id,timestamp,heading,txhash) values ("'+user_id+'","'+timestamp+'","'+heading+'","'+txhash+'")',function(err){
				if(!err){
					db.run('update times set number = ? where user_id = ?',number-1,user_id);
					if(callback && typeof(callback) === "function"){
						callback(0);
					} else{
						var err = "failed insert into database";
						callback(err);
						logger.error(err);
					}
				} else{
					// console.log(err);
					logger.error(err);
				}
			});
		} 
		else{
			var err = "times run out!";
			callback(err);
			// console.log(err);
			logger.error(err);
		}
             }
	     else{
		var err = "times run out!";
		callback(err);
		logger.error(err);
}
	});

}

exports.lookup = function(data,callback){
	var user_id = data.user_id;
	var timestamp = data.timestamp;
	db.all('select txhash from user where user_id is "'+user_id+'"and timestamp is "'+timestamp+'"',function(err,result){
		if(!err&&result.length!=0){
			db.all('select heading from user where user_id is "'+user_id+'"and timestamp is "'+timestamp+'"',function(err,heading){
				if(!err){
					var txhash = JSON.parse(JSON.stringify(result))[0].txhash;
					var heading = JSON.parse(JSON.stringify(heading))[0].heading;	
					var data_return = {};
					data_return.txhash = txhash;
					data_return.heading = heading;
					callback(data_return);
				}else{
					callback(null);	
					logger.error(err);
				}
			});
			
		}else{
			callback(null);
			//console.log(err);
		}

	});
}

exports.lookupFromId = function(data,callback){
	var id = data;
	db.all('select user_id,timestamp,heading,txhash from user where id is "'+id+'"',function(err,result){
		if(!err&&result.length!=0){
		  var data_return = {};
		  data_return.user_id = JSON.parse(JSON.stringify(result))[0].user_id;
		  data_return.timestamp = JSON.parse(JSON.stringify(result))[0].timestamp;
		  data_return.heading = JSON.parse(JSON.stringify(result))[0].heading;
		  data_return.txhash = JSON.parse(JSON.stringify(result))[0].txhash;
		  callback(data_return);
	}else{
		callback(null);
}
});
}

exports.insertToImport = function(data,callback){
	var user_id = data.user_id;
	var timestamp = data.timestamp;
	var heading = data.heading;
	var text = data.text;
	var img = data.img;
	var id = data.id;
	db.run('insert into import (id,user_id,timestamp,heading,text,img) values ("'+id+'","'+user_id+'","'+timestamp+'","'+heading+'","'+text+'","'+img+'")',function(err){
	if(!err){
		console.log("insert into import success!");
	}else{
		console.log("insert into import faild!");
	callback(err);}
});
}

exports.lookupTimes = function(data,callback){
	var user_id = data;
	db.all('select number from times where user_id is "'+user_id+'"',function(err,result){
		if(!err&&result.length!=0){
			var number = JSON.parse(JSON.stringify(result))[0].number;
			callback(number);
		}else{
			console.log("no such record for number");
			callback(false);
		}
	});
}
