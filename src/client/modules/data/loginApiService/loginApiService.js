const URL = "/api/login";
export const performLogin = (loginCredentials) => fetch(URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: loginCredentials
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('No response from server');
        }
        return response.json();
    }).then(result => {
        return result;
    });