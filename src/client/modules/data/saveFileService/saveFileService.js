const URL = "/api/saveFile?objName=";
let fields;
export const saveFile = (fileData, objName) => fetch(URL + objName, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: fileData
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