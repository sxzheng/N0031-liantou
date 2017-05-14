var Web3 = require('web3');
var async = require('async');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
var log4js = require('log4js');
log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('./log/jinianri.log'),'jinianri');
var logger = log4js.getLogger('jinianri');

exports.getData = function(transaction_hash,callback){
	var text = '';
	var img = [];
	var dataArray = [];
	var prefix = '0x';
	var flag = '';
	var hash = [prefix,transaction_hash].join('');
	async.whilst(
		function(){
			return (flag != '01');
		},
		function(cb){
			//console.log(hash);
			web3.eth.getTransaction(hash,function(err,result){
				if(!err){
					try{
					var data = JSON.parse(JSON.stringify(result)).input;
					//取flag
					flag = data.substring(2,4);
					//console.log(flag);
					//数据完整
						var hashData = data.substring(4,68);
						var dataEncode = data.substring(68,data.length);
						//收集数据
						//console.log(dataEncode);
						dataArray.push(dataEncode);
						hash = [prefix,hashData].join('');
						//console.log(flag);
						// cb();
					
					//分块数据整理 
					 if(flag == '10'){
						var hashData = data.substring(4,68);
						var piece = data.substring(68,data.length);
						hash = [prefix,hashData].join('');
						//开始碎片整理
						var dataPiece1 = [];
						dataPiece1.push(piece);
						cb();
					}
						//遇见最后一块数据碎片，开始整理碎片为整块数据
					else if(flag == '02'){
							var hashData = data.substring(5,69);
							hash = [prefix,hashData].join('');	
							var dataPiece = data.substring(69,data.length);
							for(var i=dataPiece1.length-1;i>=0;i--){
								dataPiece += dataPiece1[i];
							}
							//将整理好的碎片数据加入主链
							dataArray.push(dataPiece);
							cb();
						}
						cb();
					}
					catch(e){
						callback(0);
					}
				} else{
					// console.log("err");
					logger.error(err);
				}
			});
		},
		function(err){
			//console.log("end");
			//console.log(dataArray);
			callback(dataArray);
			logger.error(err);
			//console.log(err);
		});
	
}
