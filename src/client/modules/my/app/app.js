import { LightningElement, track } from 'lwc';
import { getObjects } from 'data/apiService';
import { getFields } from 'data/fieldApiService';
import { createObject } from 'data/createObjectService';
import { performLogin } from 'data/loginApiService';
import { performLogout } from 'data/logoutApiService';

export default class App extends LightningElement {
    @track objects = [];
    @track objectMetadata = [];
    @track hasSelectedObject = true;
    @track parsedMetadata = {};
    @track isModalOpen = true;
    @track isLoggedIn = false;
    @track showLoader = false;

    //Login Credentials
    @track credentials = {
        userName: '',
        password: '',
        securityToken: '',
        passAndToken: ''
    }

    newLookupField;

    handleChange(event) {
        this.hasSelectedObject = false;
        this.objectMetadata = [];
        this.showLoader = true;
        getFields(event.target.value).then(result => {
            this.objectMetadata = result;
            this.hasSelectedObject = true;
            this.parsedMetadata = JSON.parse(this.objectMetadata);
            //New Lookup field related to Source Object
            this.newLookupField = {
                "fullName": this.parsedMetadata.fullName,
                "externalId": "false",
                "label": this.parsedMetadata.label + " Lookup",
                "referenceTo": this.parsedMetadata.fullName,
                "relationshipLabel": this.parsedMetadata.label + "Lookup",
                "relationshipName": this.parsedMetadata.label + "s",
                "required": "false",
                "type": "Lookup"
            };
            if (this.parsedMetadata.fullName) {
                if (!this.parsedMetadata.fullName.endsWith("__c"))
                    this.parsedMetadata.fullName = this.parsedMetadata.fullName + "_Extend__c";
                else
                    this.parsedMetadata.fullName = this.parsedMetadata.fullName.replace("__c", "_Extend__c ");
                this.parsedMetadata.label = this.parsedMetadata.label + " Extend";
                this.parsedMetadata.pluralLabel = this.parsedMetadata.label + " Extend";
                this.parsedMetadata.nameField = {
                    type: 'Text',
                    label: this.parsedMetadata.label
                };
                this.parsedMetadata.deploymentStatus = 'Deployed';
            }
            if (this.parsedMetadata.fields && this.parsedMetadata.fields.length > 0) {
                this.parsedMetadata.fields.forEach(element => {
                    if (!element.label) {
                        element.label = element.fullName;
                        element.label = element.label.replace(/([A-Z])/g, ' $1').trim();
                    }
                    if (!element.fullName.endsWith("__c")) {
                        element.fullName = element.fullName + "_std__c"
                    }
                    //console.log(element.label);
                });
                this.parsedMetadata.fields.push(this.newLookupField);
            }
            // To remove the Error ->  * is not a standard action and cannot be overridden
            var key = "actionOverrides";
            delete this.parsedMetadata[key];
            this.parsedMetadata = JSON.stringify(this.parsedMetadata);
            console.log(this.parsedMetadata);
        });
        this.showLoader = false;
    }
    handleUsernameChange(event) {
        this.credentials.userName = event.target.value;
    }
    handlePasswordChange(event) {
        this.credentials.password = event.target.value;
    }
    handleTokenChange(event) {
        this.credentials.securityToken = event.target.value;
    }
    handleCreate(event) {
        this.showLoader = true;
        createObject(this.parsedMetadata).then(result => {
            console.log("Object Created !! ", result);
        });
        this.showLoader = false;
    }
    openModal() {
        this.isModalOpen = true;
    }
    closeModal() {
        this.isModalOpen = false;
    }
    loginUser() {
        //this.credentials.userName || this.credentials.password || this.credentials.securityToken || 
        this.credentials.passAndToken = this.credentials.password + this.credentials.securityToken;
        if (this.credentials.userName == '' || this.credentials.password == '' || this.credentials.securityToken == '') {
            this.showSnackbar('error', 'Please fill all the fields.');
        } else {
            this.showLoader = true;
            let loginData = JSON.stringify(this.credentials);
            performLogin(loginData).then(result => {
                console.log('PerformLogin Result  ' , result.data);
                if(result.error){
                    this.openModal();
                    this.showSnackbar('error', 'Login Unsuccessful !');
                } else if(result.data){
                    this.showSnackbar('success', 'Logged In !');
                    this.isLoggedIn = true;
                    getObjects().then(result => {
                        this.objects = result;
                    });
                }
            });
            this.showLoader = false;
        }
    }
    logOut() {
        this.showLoader = true;
        performLogout().then(result => {
            console.log('logout result = ', result);
            this.isLoggedIn = false;
            this.showSnackbar('success', 'Logged Out !');
        });
        this.showLoader = false;
    }
    showSnackbar(variant = 'error', message = 'Some Error Occoured !', duration = 3000) {
        this.template.querySelector('.snackbar').innerHTML= message;
        this.template.querySelector('.snackbar').classList.add('show' , variant);
        setTimeout(() => {
            this.template.querySelector('.snackbar').classList.remove('show' , variant);
        }, duration);
    }
}