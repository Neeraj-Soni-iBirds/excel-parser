const URL = "/api/saveFile";
let fields = [];
export const saveFile = (metadata) => fetch(URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: metadata
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