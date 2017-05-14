exports.cut = function(data,callback){
	var numOfPiece = Math.ceil(data.length/129024);
	var dataPiece = [];
	for (var i = 0; i<numOfPiece; i++){
		if((i*129024+129023)<data.length){
			dataPiece[i] = data.substring(i*129024,i*129024+129023);
		}else{
			dataPiece[i] = data.substring(i*129024,data.length);
		}
	}

	if(callback && typeof(callback) === "function"){
		callback(dataPiece);
	}
}