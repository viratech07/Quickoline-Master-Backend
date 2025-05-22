const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const userSchema = new mongoose.Schema({
    email: {
        type: String,
         unique: true, 
         required: [true, 'Email is required'],
         match: [/.+\@.+\..+/, 'Please fill a valid email address'],
        
        } ,whatsappNumber:{
                type: Number,
                required: [true, 'WhatsApp number is required'],
                unique: true,
                trim: true,
                }, 
                password:{
                type: String,
                required: [true, 'Password is required'],
                select: false,
                },

            firstName:{
                   type: String,
                   required: false,
                   default: null
                 },

              lastName:{
                   type: String,
                   required: false,
                   default: null
                 },

             role:{
                 type: String, 
                 enum: ['user', 'app_admin', 'web_admin', 'senior_admin', 'super_admin'],
                 default:'user'
           },

           isActive:{
                  type:Boolean,
                  default: true
          },

            passwordResetToken: String,
            passwordResetExpires: Date,
            profilePicture: String,



            address: [{
                street:String,
                city:String,
                state:String,
                zipCode:String,
                country:String  
           }], 


            referCode:{
              type: String,
              unique: true,
              sparse: true
           },

            referredBy:{
               type: mongoose.Schema.Types.ObjectId,
               ref:'User',
               default: null
           }, 

           referredRewards:{
                       type: Number,
                       default: 0
           },
            
         referredUser:[{
               type: mongoose.Schema.Types.ObjectId,
               ref:'User'
           }], 

        feedbacks:[{ 

        userId:{
              type: mongoose.Schema.Types.ObjectId,
              ref: 'user'
        },

       type: {
              type: String,
              enum: ['Service', 'Bug report', 'Suggestion', 'Other'],
               required: true
       },

       description: {
                type: String,
                required: true
      },

       rating: {
            type: Number,
            min: 1,
            max: 5
       },

      status: {
            type: String,
            enum: ['Pending', 'Reviewed', 'Resolved'],
            default: 'Pending'
    },
          timestamps: true,  

  }],


           contacts:[{
      
           name:{
                      type: String,
                      required: true
                   },

           phone:{
                 type: String,
                 reuired: true
             },
              
              email:{
                   type: String,
                   match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
     
      notes: String,
          status:{
               type: String,
               enum:['Open','In Progress', 'Closed'],
               default:'Open'
           },
 
             priority:{
                 type: String,
                  enum: ['Low', 'Medium', 'High'],
                  default: 'Medium'
   },
 
         timestamps: true
        }],

           lastLogin:{
                 type:Date,
                 default: null
          },

          timestamps: true

       });

// #Hashing and comparing passwords

const hashPassword = async (password) => {
    return await bcrypt.hash(password, 12);
};

const comparePasswords = async (plain, hashed) => {
    return await bcrypt.compare(plain, hashed);
};

module.exports = { hashPassword, comparePasswords };
 
                    
const User = mongose.model('User', userSchema);

module.exports = User;
