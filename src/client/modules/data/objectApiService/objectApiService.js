const URL = '/api/objects';
let objects = [];
export const getObjects = () => fetch(URL)
	.then(response => {
		if (!response.ok) {
			throw new Error('No response from server');
		}
		return response.json();
	})
	.then(result => {
		objects = result.data;
		return objects;
	}); 