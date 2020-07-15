var mongoose = require('mongoose');

module.exports.connect = function() {
	mongoose.connect('mongodb+srv://admin:012020Mongodb!@simple-gantt-cluster-lo6fo.mongodb.net/bank-transactions-db?retryWrites=true&w=majority');
	var db = mongoose.connection;
	db.on("error", console.error.bind(console, "connection error"));
	db.once("open", function(callback){
	  console.log("Connection Succeeded -------------- ")
	});
	return db;
}