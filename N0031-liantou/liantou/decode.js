//解码
String.prototype.hexDecode = function(){
	var j;
	var hexs = this.match(/.{1,4}/g)||[];
	var back = "";
	for(j=0; j<hexs.length;j++){
		back += String.fromCharCode(parseInt(hexs[j],16));
	}
	return back;
}

exports.decode = function(data,callback){

	analysis(data,function(result){

		var text = result.text;
		var img = result.img;
		var textDecode = text.hexDecode();
		var imgDecode = [];
		var dataReturn = {};
		for(var i in img){
			var imgTODecode = img[i];
			imgDecode[i] = imgTODecode.hexDecode();
		}
		dataReturn.text = textDecode;
		dataReturn.img = imgDecode;
		callback(dataReturn);

	});

}

function analysis(data,callback){
	var length = data.length;
	var text = data.pop();
	var img = [];
	var dataReturn = {};
	for(var i=0;i<length-1;i++){
		img[i] = data.pop();
	}
	dataReturn.text = text;
	dataReturn.img = img;
	callback(dataReturn);
}	