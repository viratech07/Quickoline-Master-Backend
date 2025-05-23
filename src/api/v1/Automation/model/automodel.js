const mongoose = require('mongoose');

const automodelSchema = new mongoose.Schema({
    
    form_name: {
        type : String,
        req : true
    },

    form_page_name : {
        type : String,
        req : true
    },

    form_url_pattern : {
        type : String,
        req : true
    },

    fields : [
        {
            fields_name : {
                type : String,
                req : true
            },  
   
            fields_type : {
                type : String,
                req : true,
                Enum : ['text', 'number', 'date', 'dropdown', 'radio', 'check-box', 'button']
            },
     
            fields_selector : {
                type : String,
                req : true
            },
           }
          ],
 
     created_at : {
         type : String,
         default : Date.now
        },


     identfier : {
         type : string,
         req : true
       }
});

const automation = mongoose.model('FormAutomation',automodelSchema);
module.exports = automation;
 

