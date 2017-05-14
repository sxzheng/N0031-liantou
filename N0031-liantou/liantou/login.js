var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('./data.db');
var log4js = require('log4js');
log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('./log/jinianri.log'),'jinianri');
var logger = log4js.getLogger('jinianri');

exports.login = function(user_id,callback){
	var timeRecord = [];
	var headingRecord = [];
	var data_return = {};
	const defaultTimes = 10; 
	db.all('select timestamp from user where user_id is "'+user_id+'"',function(err,time){
		if(!err){
			db.all('select heading from user where user_id is "'+user_id+'"',function(err,heading){
				if(!err){
					db.all('select number from times where user_id is "'+user_id+'"',function(err,number){
						if(!err&&number.length!=0){
							var data_time = JSON.parse(JSON.stringify(time));
							var data_heading = JSON.parse(JSON.stringify(heading));
							var data_number = JSON.parse(JSON.stringify(number))[0].number;
							for(var i in data_time){
								timeRecord.push(data_time[i].timestamp);
							}
							for(var i in data_heading){
								headingRecord.push(data_heading[i].heading);
							}
							data_return.record = timeRecord;
							data_return.heading = headingRecord;
							data_return.number = data_number;
							if (callback && typeof(callback) === "function"){
								callback(data_return);
							}
						} else{
							db.run('insert into times (user_id,number) values ("'+user_id+'","'+defaultTimes+'")',function(err){
								if(!err){
									var data_time = JSON.parse(JSON.stringify(time));
									var data_heading = JSON.parse(JSON.stringify(heading));
									var data_number = JSON.parse(JSON.stringify(number));
									for(var i in data_time){
										timeRecord.push(data_time[i].timestamp);
									}
									for(var i in data_heading){
										headingRecord.push(data_heading[i].heading);
									}
									data_return.record = timeRecord;
									data_return.heading = headingRecord;
									data_return.number = defaultTimes;
									if (callback && typeof(callback) === "function"){
										callback(data_return);
									}	
								}
							});
						}
					});
				} else{
					logger.error(err);
					// console.log(err);
				}
			});
		} else {
			logger.error(err);
			// console.log(err);
		}
	});
}
