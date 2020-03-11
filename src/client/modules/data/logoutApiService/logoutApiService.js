const URL = '/api/logout';
export const performLogout = () => fetch(URL)
	.then(response => {
		if (!response.ok) {
			throw new Error('No response from server');
		}
		return response.json();
	})
	.then(result => {
		return result;
	}); 