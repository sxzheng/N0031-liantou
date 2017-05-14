
exports.encode = function(data,callback){
	//文本编码
	String.prototype.hexEncode = function(){
			var hex,i;
			var result = "";
			var prefix = "0x";
			for(i = 0; i<this.length; i++){
				hex = this.charCodeAt(i).toString(16);
				result+=("000"+hex).slice(-4);
			
			}
			return result;
		}

	var text = data.text;
	var img = data.img;
	var dataEncode = [];
	dataEncode.push(text.hexEncode());
	for(var i in img){
		var imgToEncode = img[i];
		dataEncode.push(imgToEncode.hexEncode());
	}

	if(callback && typeof(callback) === "function"){
		callback(dataEncode);
	}
}