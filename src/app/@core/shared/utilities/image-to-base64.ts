
export function getLocalBase64ImageFromURL(url) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.setAttribute("crossOrigin", "anonymous");

		img.onload = () => {
			const canvas = document.createElement("canvas");
			canvas.width = img.width;
			canvas.height = img.height;

			const context = canvas.getContext("2d");
			context?.drawImage(img, 0, 0);

			const dataURL = canvas.toDataURL("image/png");

			resolve(dataURL);
		};

		img.onerror = error => {
			reject(error);
		};

		img.src = url;
	});
}

export function getBase64Image(img) {
	return new Promise((resolve, reject) => {
		convert(img, function(newImg) {
			const canvas = document.createElement("canvas") as HTMLCanvasElement;
			canvas.width = newImg.width;
			canvas.height = newImg.height;
			const context = canvas.getContext("2d");
			context?.drawImage(newImg, 0, 0);
			const base64=canvas.toDataURL("image/png");
			resolve(base64);
		}, (error) => {
			reject(error);
		});
	});
}

export function convert(imgSrc, callback, reject) {
	const img = new Image();
	img.onload = function() {
		callback(img);
	};
	img.onerror = function (error) {
		reject(error);
	};
	img.setAttribute("crossorigin", "anonymous");
	img.src = imgSrc;
}

export function imageFromDomToBase64(image: any, height = 100, width = 100) {
	const c = document.createElement("canvas");
	c.height = height;
	c.width = width;

	const ctx = c.getContext("2d");
	ctx?.drawImage(image, 0,0, height, width);

	//get image extension
	const ext = image.src.substring(image.src.lastIndexOf(".") + 1).split("?")[0];

	//return image as base64
	return c.toDataURL("image/" + ext);
}
