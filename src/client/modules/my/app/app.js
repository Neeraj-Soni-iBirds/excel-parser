import { LightningElement, track } from 'lwc';
import { getObjects } from 'data/apiService';  
import { getFields } from 'data/fieldApiService';

export default class App extends LightningElement {
    @track sessionId;
    @track state;
    @track objects;
    @track objectMetadata;
    @track hasSelectedObject;
    @track parsedMetadata;
    @track accessToken= "asd";
    newLookupField;
    constructor() {
        super();
        this.state = 'list';
        window.history.replaceState('list', null, '');
        window.onpopstate = event => {
            if (event.state) {
                this.state = event.state;
            }
        };
    }

    connectedCallback() {
        getObjects().then(result => {
            this.objects = result;
        });
        console.log(this.objects);
    }

    handleNavigate(event) {
        this.sessionId = event.detail;
        this.state = 'details';
        window.history.pushState('details', null);
    }

    get isStateList() {
        return this.state === 'list';
    }

    get isStateDetails() {
        return this.state === 'details';
    }
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
                    if(!element.label){
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
}
