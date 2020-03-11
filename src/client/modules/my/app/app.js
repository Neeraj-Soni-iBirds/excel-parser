import { LightningElement, track } from 'lwc';
import { getObjects } from 'data/apiService';
import { getFields } from 'data/fieldApiService';
import { createObject } from 'data/createObjectService';
import { performLogin } from 'data/loginApiService';
import { performLogout } from 'data/logoutApiService';

export default class App extends LightningElement {
    @track objects;
    @track objectMetadata = [];
    @track hasSelectedObject = true;
    @track parsedMetadata;
    @track isModalOpen = true;
    @track isLoggedIn = false;

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
        console.log("INSIDE HANDLECREATE", this.parsedMetadata);
        createObject(this.parsedMetadata).then(result => {
            console.log("Object Created !! ", result);
        });
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
            let loginData = JSON.stringify(this.credentials);
            performLogin(loginData).then(result => {
                console.log('PerformLogin Result  ' , result.data);
                if (( result.data.id || result.data.id == '') && ( result.data.organizationId || result.data.organizationId == '' ) && ( result.data.url || result.data.url == '')) {
                    //Error in Login Process
                    this.openModal();
                    this.showSnackbar('error', 'Something Went Wrong !');
                } else {
                    this.showSnackbar('success', 'Logged In !');
                    this.isLoggedIn = true;
                    getObjects().then(result => {
                        this.objects = result;
                    });
                }
            });
        }
    }
    logOut() {
        performLogout().then(result => {
            console.log('logout result = ', result);
            this.isLoggedIn = false;
            this.showSnackbar('success', 'Logged Out !');
        });
    }
    showSnackbar(variant = 'error', message = 'Some Error Occoured !', duration = 3000) {
        this.template.querySelector('.snackbar').innerHTML= message;
        this.template.querySelector('.snackbar').classList.add('show' , variant);
        setTimeout(() => {
            this.template.querySelector('.snackbar').classList.remove('show' , variant);
        }, duration);
    }
}