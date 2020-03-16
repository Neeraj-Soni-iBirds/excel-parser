import { LightningElement, track } from 'lwc';
import { saveFile } from 'data/saveFileService';

export default class App extends LightningElement {

    @track showLoader = false;
    @track fileName = '';
    filesUploaded = [];
    file;
    MAX_FILE_SIZE = 1500000;
    fileContents;
    fileReader;
    content;

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

    uploadHelper() {
        this.showLoader = true;
        saveFile(this.filesUploaded).then(result => {
            console.log("Parsed Result::   ", result);
        });
        this.showLoader = false;
        this.fileReader.readAsDataURL(this.file);
    }

    showSnackbar(variant = 'error', message = 'Some Error Occoured !', duration = 3000) {
        this.template.querySelector('.snackbar').innerHTML = message;
        this.template.querySelector('.snackbar').classList.add('show', variant);
        setTimeout(() => {
            this.template.querySelector('.snackbar').classList.remove('show', variant);
        }, duration);
    }
}