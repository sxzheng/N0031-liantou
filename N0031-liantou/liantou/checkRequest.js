var log4js = require('log4js');
log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('./log/jinianri.log'),'jinianri');
var logger = log4js.getLogger('jinianri');

exports.check = function(req,callback){
	try{
		var data = JSON.parse(req);
		if(typeof(data.msg_type) != 'undefined'){
			switch(data.msg_type){
				case 0:
					callback(typeof(data.user_id)!= 'undefined');
				break;
				case 1:
					if(typeof(data.user_id)=='undefined' || typeof(data.data)=='undefined'){
						callback(false);
					}else{callback(true);}
				break;
				case 2:
					if(typeof(data.user_id)=='undefined' || typeof(data.timestamp)=='undefined'){
						callback(false);
					}else{callback(true);}
				break;
				case 3:
				if(typeof(data.user_id)=='undefined'){
					callback(false);
				}else{callback(true);}
				break;
				default:
				callback(false);
			}
		}
	} catch(e){
		// console.log(e);
		logger.error(e);
		callback(false);
	}
}
