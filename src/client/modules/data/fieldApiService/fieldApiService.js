var URL = "/api/fields?objName=";
let fields = [];
export const getFields = (objName) => fetch(URL + objName)
	.then(response => {
		if (!response.ok) {
			throw new Error('No response from server');
		}
		return response.json();
	})
	.then(result => {
        fields = result.data;
		return fields;
	});