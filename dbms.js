var express = require('express');
var mysql = require('mysql2');
var bodyParser = require("body-parser");
var querystring = require("querystring");
var app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));


var pool = mysql.createPool({
    host : 'localhost',
    user : 'root',
    password : 'ryosei2K11213!',
    database : 'tree_db'
});

app.get("/search_trees", function(req, res){

    let rainfall_min = req.query.rainfall_min;
    let rainfall_max = req.query.rainfall_max
    let altitude_min = req.query.altitude_min;
    let altitude_max = req.query.altitude_max;
    var q = `SELECT botanical_name, 
                MIN(rainfall_min) AS minimum_rainfall,
                MAX(rainfall_max) AS maximum_rainfall,
                MIN(altitude_min) AS lowest_altitude,
                MAX(altitude_max) AS highest_altitude
            FROM tree
            JOIN climatic_zone
	            ON climatic_zone.tree_id = tree.id
            JOIN climatic
	            ON climatic.id = climatic_zone.climatic_id
            WHERE rainfall_min <= "${rainfall_min}" 
                AND rainfall_max >= "${rainfall_max}"
                AND altitude_min <= "${altitude_min}"
                AND altitude_max >= "${altitude_max}"
            GROUP BY tree.id
            ORDER BY tree.id`
    
    pool.query(q, function(err, results){
        console.log(results)
        res.render('search_result', {title: 'Tree List', treeData: results});
        
    });
})

app.post("/search_trees", function(req, res){
    var search_info = {
        rainfall_min: req.body.rainfall_min,
        rainfall_max: req.body.rainfall_max,
        altitude_min: req.body.altitude_min,
        altitude_max: req.body.altitude_max
    }
    const qs = querystring.stringify(search_info);
    res.redirect("/search_trees?" + qs);

})

app.post("/insert_tree", function(req, res){
    console.log(req.body);
    var tree = {
        botanical: req.body.botanical,
        somali: req.body.somali
    };
    pool.query('INSERT INTO tree SET ?', tree, function(err, result) {
        if (err) throw err;
        res.send("New Tree Added!!");
        //res.redirect("/");
    });
});

app.post("/update_tree", function(req, res){
    var tree_to_update = req.body.botanical;
    var q = `SELECT botanical_name FROM tree WHERE botanical_name= "${tree_to_update}"`;

    pool.query(q, function(err, result){
        if (err) throw err;
        var tree_name = results[0].botanical_name
        res.render('dbms_update_tree', {tree_name: tree_name});
    })
    
});

// app.post("/finish_update", function(err, results){

// })


// app.post("/update", function(req, res){
//     var id = req.body.id;
//     var newName = {
//         first_name: req.body.new_first_name,
//         last_name: req.body.new_last_name
//     };
//     // let sql = 'UPDATE employees SET first_name=${newName.newFirstName}, last_name=${newName.newLastName} WHERE id=${newName.id}'
//     let sql = 'UPDATE employees SET ? WHERE id=' + id;
//     pool.query(sql, newName, function(err, result) {
//         if (err) throw err;
//         res.send("Updated user!!");
//         res.redirect("/");
//     });
// });

app.get("/", function(req, res){
    
    //Find Tree count
    var q = "SELECT COUNT(*) AS count FROM tree";
    pool.query(q, function(err, results){
        if (err) throw err;
        var count = results[0].count
        //res.send("We have " + count + " users in database");
        res.render('dbms_home', {count: count});
    });
});

app.listen(8080, function(){
    console.log("Server running on 8080!");
});