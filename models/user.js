const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema ({
    username: 
    { 
        type: String,
        unique: true
    },
    password: String,
    gender: String,
    age: Number,
    state: String,
    city: String,
    specialty: 
    {
        type: [String],
        enum: ['Guitarra/Violão','Baixo','Bateria','Percussão','Vocal','Piano Bar/Teclado','Violino','Saxofone','Flauta']
    },
    level: 
    { 
        type: String,
        enum: ['Iniciante','Intermediário','Avançado','Profissional']
    },
    musicalInfluence: 
    {
        type: [String], 
        num: ['Rock','Jazz/Blues','MPB','Sertanejo','Eletrônico','Clássica','Metal']
    },
    facebook: String,
    instagram: String,
    email: String
})

const User = mongoose.model('User', userSchema);
module.exports = User;