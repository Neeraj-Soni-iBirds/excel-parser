import { LightningElement, track } from 'lwc';
import { saveFile } from 'data/saveFileService';
import { getObjects } from 'data/objectApiService';

export default class App extends LightningElement {

    @track showLoader = false;
    @track fileName = '';
    @track objects = [];
    @track objectName = "";
    filesUploaded = [];
    file;
    MAX_FILE_SIZE = 1500000;
    fileContents;
    fileReader;
    content;

    connectedCallback() {
        this.showLoader = true;
        getObjects().then(result => {
            this.objects = result;
        });
        this.showLoader = false;
    }

    handleFilesChange(event) {
        if (event.target.files.length > 0) {
            this.filesUploaded = event.target.files;
            this.fileName = event.target.files[0].name;
        }
    }

    handleChange(event) {
        this.objectName = event.target.value;
    }

    handleSave() {
        if (this.filesUploaded.length > 0 && (this.objectName != '' || this.objectName != 'none')) {
            this.showLoader = true;
            this.uploadHelper();
            this.showLoader = false;
        } else {
            console.log('INSIDE ELSE CONDITION');
            this.fileName = 'Please select file to upload!!';
            this.showSnackbar('error', 'Select file and Object');
        }
    }

    uploadHelper() {
        this.file = this.filesUploaded[0];
        if (this.file.size > this.MAX_FILE_SIZE) {
            window.console.log('File Size is to long');
            return;
        }
        // create a FileReader object 
        this.fileReader = new FileReader();
        // set onload function of FileReader object  
        this.fileReader.onloadend = (() => {
            this.fileContents = this.fileReader.result;
            let base64 = 'base64,';
            this.content = this.fileContents.indexOf(base64) + base64.length;
            this.fileContents = this.fileContents.substring(this.content);

            let sheetData = JSON.stringify(
                {
                    data: this.fileContents,
                    name: this.fileName
                }
            );

            saveFile(sheetData, this.objectName).then(result => {
                if (JSON.parse(result).state)
                    this.showSnackbar('success', JSON.parse(result).state);
                else if (JSON.parse(result).errorMessage)
                    this.showSnackbar('success', JSON.parse(result).errorMessage);
            });
        });
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