function uploadAvatar() {
	const avatarInput = document.getElementById("avatarInput");
	const file = avatarInput.files[0];

	if (file) {
		const reader = new FileReader();

		reader.onload = async function (e) {
			const encoder = new TextEncoder();
			const avatarData = {
				data: encoder.encode(new Uint8Array(e.target.result)),
				contentType: file.type,
			};

			const newData = await window.electronAPI.create("avatar", avatarData);
			const img = document.getElementById("img");
			const uint8Array = new Uint8Array(avatarData.data);

			// Use TextDecoder to convert Uint8Array to a string
			const binaryString = new TextDecoder().decode(uint8Array);

			// Convert the binary string to a base64-encoded string
			const base64Data = btoa(binaryString);

			// Create a data URI for the image
			const dataURI = `data:${avatarData.contentType};base64,${base64Data}==`;
			console.log(dataURI);

			img.src = dataURI;
		};

		reader.readAsArrayBuffer(file);
	}
}
