var handleGetData = require('./getData');
var handleDecode = require('./decode');
var handleSqlite = require('./handleSqlite');
var id = 29;
for(id=29;id<=120;id++){
	handleSqlite.lookupFromId(id,function(result){
		if(result){
		  var user_id = result.user_id;
		  var timestamp = result.timestamp;
		  var heading = result.heading;
		  var txhash = result.txhash;
		  handleGetData.getData(txhash,function(dataArray){
			if(dataArray){
			  handleDecode.decode(dataArray,function(dataDecode){
			  var text = dataDecode.text;
			  var img = dataDecode.img;
			  var dataToSqlite = {};
			  dataToSqlite.id = id;
			  dataToSqlite.user_id = user_id;
			  dataToSqlite.timestamp = timestamp;
			  dataToSqlite.heading = heading;
			  dataToSqlite.text = text;
			  dataToSqlite.img = img;
			  handleSqlite.insertToImport(dataToSqlite,function(err){
				if(!err){console.log("complete!");
				}
								
				else{console.log(err);
				}
			   });
			});
			}
	});
	}
});
}
