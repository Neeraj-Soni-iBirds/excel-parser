const URL = "/api/login";
let fields = [];
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
        fields = result.data;
        return fields;
    });