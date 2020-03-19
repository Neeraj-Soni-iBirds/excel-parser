import { LightningElement, track } from 'lwc';
import { saveFile } from 'data/saveFileService';
import { getObjects } from 'data/objectApiService';

export default class App extends LightningElement {

    @track showLoader = false;
    @track fileName = '';
    @track objects = [];

    filesUploaded = [];
    file;
    MAX_FILE_SIZE = 1500000;
    fileContents;
    fileReader;
    content;

    connectedCallback(){
        getObjects().then(result => {
            this.objects = result;
        });
    }

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
        this.file = this.filesUploaded[0];
        console.log('filefilefile :: ' ,this.file);
        if (this.file.size > this.MAX_FILE_SIZE) {
            window.console.log('File Size is to long');
            return;
        }
        this.showLoader = true;
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

            saveFile(sheetData).then(result => {
                console.log("Parsed Result::   ", result);
            });
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