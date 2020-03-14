import { LightningElement, track } from 'lwc';

export default class App extends LightningElement {

    @track showLoader = false;
    @track fileName = '';
    filesUploaded = [];

    handleFilesChange(event) {
        if (event.target.files.length > 0) {
            this.filesUploaded = event.target.files;
            this.fileName = event.target.files[0].name;
        }
    }

    handleSave() {
        if (this.filesUploaded.length > 0) {
            this.uploadHelper();
        } else {
            this.fileName = 'Please select file to upload!!';
        }
    }

    showSnackbar(variant = 'error', message = 'Some Error Occoured !', duration = 3000) {
        this.template.querySelector('.snackbar').innerHTML = message;
        this.template.querySelector('.snackbar').classList.add('show', variant);
        setTimeout(() => {
            this.template.querySelector('.snackbar').classList.remove('show', variant);
        }, duration);
    }
}