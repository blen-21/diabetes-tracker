// mongoose connection and schema definition
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.connect("mongodb://localhost:27017/diabetes-database", {
    serverSelectionTimeoutMS: 5000
})
  .then(() => {
    console.log("mongodb connected");
  })
  .catch(() => {
    console.log("failed to connect");
  });

const LogInSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  email:{
    type: String
  },
  fname: {
    type: String
  },
  lname: {
    type: String
  },
  diseases:{
    type:[String]
  },
  age:{
    type: String
  },
  gender:{
    type: String
  },
  sugarLogs:[{ type: Schema.Types.ObjectId, ref: 'SugarLog' }] // Array of references to SugarLog
});
const User = mongoose.model("User", LogInSchema);
// Sugar Log Schema
const sugarLogSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    date: { type: Date, default: Date.now },
    timeOfDay: { type: String, required: true }, 

    sugarLevel: { type: String, required: false }, 

    sugarLevel: { type: Number, required: true }, 

    notes: { type: String } 
});

const SugarLog = mongoose.model('SugarLog', sugarLogSchema);
module.exports = {
  User,
  SugarLog
};