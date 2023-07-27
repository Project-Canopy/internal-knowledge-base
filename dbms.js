var express = require('express');
var mysql = require('mysql2');
var bodyParser = require("body-parser");
var app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

var connection = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'ryosei2K11213!',
    database: 'tree_db'
})

app.post("/register", function(req, res){
    console.log(req.body);
    var person = {
        first_name: req.body.first_name,
        last_name: req.body.last_name
    };
    pool.query('INSERT INTO employees SET ?', person, function(err, result) {
        if (err) throw err;
        res.send("New User Added!!");
        //res.redirect("/");
    });
});

app.post("/update", function(req, res){
    var id = req.body.id;
    var newName = {
        first_name: req.body.new_first_name,
        last_name: req.body.new_last_name
    };
    // let sql = 'UPDATE employees SET first_name=${newName.newFirstName}, last_name=${newName.newLastName} WHERE id=${newName.id}'
    let sql = 'UPDATE employees SET ? WHERE id=' + id;
    pool.query(sql, newName, function(err, result) {
        if (err) throw err;
        res.send("Updated user!!");
        res.redirect("/");
    });
});

app.get("/", function(req, res){
    //Find user count
    var q = "SELECT COUNT(*) AS count FROM employees";
    pool.query(q, function(err, results){
        if (err) throw err;
        var count = results[0].count
        //res.send("We have " + count + " users in database");
        res.render('home', {count: count});
    });
});

app.listen(8080, function(){
    console.log("Server running on 8080!");
});