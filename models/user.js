const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema ({
    username: 
    { 
        type: String,
        unique: true
    },
    password: String,
    name: String,
    lastName: String,
    firstLogin: Boolean,
    welcomeMessage: String,
    gender: [String],
    age: Number,
    state: String,
    city: String,
    specialty: 
    {
        type: [String],
        enum: ['Guitarra/Violão','Baixo','Bateria','Percussão','Vocal','Piano Bar/Teclado','Violino','Saxofone']
    },
    level: 
    { 
        type: [String],
        enum: ['Iniciante','Intermediário','Avançado','Profissional']
    },
    musicalInfluence: 
    {
        type: [String], 
        num: ['Rock', 'Metal', 'Jazz & Blues', 'Samba', 'MPB', 'Sertanejo', 'Clássica', 'Eletrônico']
    },
    invitationReceived: [String],
    friendship: [String],
    // lookingFor: String,
    bio: String,
    facebook: String,
    instagram: String,
    email: String,
    imgPath: String,
    originalName: String
})

const User = mongoose.model('User', userSchema);
module.exports = User;