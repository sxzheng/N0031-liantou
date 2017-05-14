var cutData = require('./cutData');
var Web3 = require('web3');
var web3 = new Web3();
var async = require('async');

web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
var account = web3.eth.accounts[0];
exports.store = function(dataEncode,callback){
	//二次编码并存储
	//四个flag标志
	var flag_extIndex_go = '00';
	var flag_extIndex_stop = '01';
	var flag_inIndex_go = '10';
	var flag_inIndex_stop = '22';
	var hash0 = '0000000000000000000000000000000000000000000000000000000000000000';
	var prefix = '0x';
	var textEncode = dataEncode[0];
	var hash = '';
	var dataToStorage = '';
	var k = 0;
	//处理text
	//外循环和内循环,先不考虑分片
	async.whilst(
	function(){
		return k < dataEncode.length;
	},
	function(cb){
		console.log('save data...');
		//处理文本
		if(k == 0){
			dataToStorage = [prefix,flag_extIndex_stop,hash0,textEncode].join('');
			web3.eth.sendTransaction({from:account,to:account,data:dataToStorage,gas:90000},function(err,result){
				if(!err){
					hash = result.substring(2,result.length);
					//console.log(hash);
					k++;
					cb();	
				} else{console.log(err);}
			});
		}
		//处理图片
		else{
			var imgEncode = dataEncode[k];
			if(imgEncode.length<129024){
				dataToStorage = [prefix,flag_extIndex_go,hash,imgEncode].join('');
				web3.eth.sendTransaction({from:account,to:account,data:dataToStorage,gas:90000},function(err,result){
					hash = result.substring(2,result.length);
					//console.log(hash);
					k++
					cb();	
				});
			} else{
				var j = 0;
				cutData.cut(imgEncode,function(dataPiece){
					async.whilst(
						function(){
							return j<dataPiece.length;
						},
						function(cb){
							if(j==0){
								var firstPiece = dataPiece[0];
								dataToStorage = [prefix,flag_inIndex_stop,hash,firstPiece].join('');// 多了一个0
								//console.log(dataToStorage);
								web3.eth.sendTransaction({from:account,to:account,data:dataToStorage,gas:90000},function(err,result){
									hash = result.substring(2,result.length);
									j++;
									cb();
								});
							}else{
								var otherPiece = dataPiece[j];
								dataToStorage = [prefix,flag_inIndex_go,hash,otherPiece].join('');
								web3.eth.sendTransaction({from:account,to:account,data:dataToStorage,gas:90000},function(err,result){
									hash = result.substring(2,result.length);
									j++;
									cb();
								});
							}
						},
						function(err){
							console.log(err);
						});
				});
			}
		}
	},
	function(err){
		callback(hash);
		console.log(err);
	});
}

exports.isStored = function(transaction_hash,callback){
	web3.eth.getTransactionReceipt(transaction_hash,function(err,result){
		if(err){
			callback(false);
		} else{
			callback(true);
		}
	});
}
