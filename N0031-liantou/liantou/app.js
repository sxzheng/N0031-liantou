var app = require('express')();
var handleLogin = require('./login');
var handleEncode = require('./encode');
var handleStoreData = require('./storeData_v2');
var handleGetData = require('./getData');
var handleDecode = require('./decode');
var handleSqlite = require('./handleSqlite');
var checkRequest = require('./checkRequest');
var log4js = require('log4js');
var fs = require('fs');
log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('./log/jinianri.log'),'jinianri');

var logger = log4js.getLogger('jinianri');
 var https = require('https');

 var SSLPort = 443;
https.createServer({
 	key: fs.readFileSync('./private.key'),
  	cert: fs.readFileSync('./file.crt')
 },app).listen(SSLPort);
console.log("server is on :"+SSLPort);


app.get('/', function(req, res) { 
	res.send('Hello');
})


app.post('/',function(req,res){

	var body = '';
	req.on('data',function (chunk){
		body += chunk;
	});	

	req.on('end',function(){
		
	logger.info('request: '+body);
	checkRequest.check(body,function(result){
		if(result){
				var data_receive  = JSON.parse(body);
				var user_id = data_receive.user_id;
				var msg_type = data_receive.msg_type;
				var data_send = {};
				//logger.info('request: msg_type: '+msg_type+'; body: '+body);
				switch(msg_type){
					case 0:
							
							// console.log("request msg_type 0");

						handleLogin.login(user_id,function(result){
							if(result){
								data_send.msg_type = 0;
								data_send.record = result.record;
								data_send.heading = result.heading;
								data_send.number = result.number;
								data_send.err_code = 0;
								logger.info('response: '+JSON.stringify(data_send));
								res.send(data_send);
							}else{
								console.log("")
								data_send.msg_type = 0;
								data_send.err_code = 1;
								data_send.record = "no record!";
								logger.info('response: '+JSON.stringify(data_send));
								res.send(data_send);
							}
						});
					break;
					case 1:
						 handleEncode.encode(data_receive.data,function(result){
							console.log(result);
						 	handleStoreData.store(result,function(returnHash){
						 		//处理数据库
						 	// 	console.log(returnHash);
						 	
								 		var dataToSqlite = {};
								 		dataToSqlite.timestamp = data_receive.data.timestamp;
								 		dataToSqlite.heading = data_receive.data.heading;
										dataToSqlite.user_id = user_id;
										dataToSqlite.txhash = returnHash;
								 		handleSqlite.insert(dataToSqlite,function(err){
								 			if(!err){
								 				data_send.msg_type = 1;
								 				data_send.err_code = 0;
												logger.info('response: '+JSON.stringify(data_send));
								 				res.send(data_send);
								 			} else {
								 				console.log(err);
								 			}
								 		});

						 	});
						 });
					break;
					case 2:

						var timestamp = data_receive.timestamp;
						var dataToSqlite = {};
						dataToSqlite.user_id = user_id;
						dataToSqlite.timestamp = timestamp;
						handleSqlite.lookup(dataToSqlite,function(result){
							//查询记录
							if(result){
								var txhash = result.txhash;
								var heading = result.heading;
								handleGetData.getData(txhash,function(dataArray){
									if(dataArray){
										handleDecode.decode(dataArray,function(dataDecode){
											data_send.msg_type = 2;
											data_send.err_code = 0;
											data_send.user_id = user_id;
											data_send.data ={};
											data_send.data.timestamp = timestamp;
											data_send.data.heading = heading;
											data_send.data.text = dataDecode.text;
											data_send.data.img = dataDecode.img;
											logger.info('response: '+JSON.stringify(data_send));			
											res.send(data_send);
										});
									}else{
										var err = "no such record!";
										logger.error(err);
										res.send(err);
									}

								});
							} else {
								data_send.msg_type = 2;
								data_send.err_code = 1;
								data_send.user_id = user_id;
								data_send.data = "No such record!";
								logger.info('response: '+JSON.stringify(data_send));
								res.send(data_send);
							}
						});
					break;
					case 3:
						handleSqlite.lookupTimes(user_id,function(result){
							if(result){
								data_send.msg_type = 3;
								data_send.err_code = 0;
								data_send.number = result;
								logger.info('response: '+JSON.stringify(data_send));
								res.send(data_send);
							}else{
								data_send.msg_type = 3;
								data_send.err_code = 1;
								logger.info('response: '+JSON.stringify(data_send));
								res.send(data_send);
							}
						});
					break;
					default:
					logger.info('response: '+JSON.stringify(data_send));
					res.send("request error!");
				}
			} else{
				res.send("request error!");
			}
		});

	});
});

