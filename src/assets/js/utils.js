function custom_saverjs(blob, fileName) {

	console.log("GOT TO JS DOWNLOAD>>", fileName);
	//Android Download
	var reader = new FileReader;
	reader.onload = function () {
		var base64data = reader.result;
		Android.downloadFile(base64data, fileName);
	};
	reader.readAsDataURL(blob);
}

function saveUserAndroid(user) {
	console.log("GOT TO saveUser>>", user);

	//Android Shared preference
	Android.saveUser(JSON.stringify(user));
}
