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
    console.log(rainfall_min)
    let rainfall_max = req.query.rainfall_max;
    let altitude_min = req.query.altitude_min;
    let altitude_max = req.query.altitude_max;
    let utilities = req.query.utilities;
    let select_list = req.query.select;
    if(typeof utilities == 'string'){
        utilities = [utilities]
    }
    if(typeof select_list == 'string'){
        select_list = [select_list]
    }
    console.log(utilities)
    let select_statement = "SELECT botanical_name"
    if (select_list.includes("Minimum Rainfall")) {
        select_statement += ", MIN(rainfall_min) AS minimum_rainfall"
    }
    if (select_list.includes("Maximum Rainfall")) {
        select_statement += ", Max(rainfall_max) AS maximum_rainfall"
    }
    if (select_list.includes("Lowest Altitude")) {
        select_statement += ", MIN(altitude_min) AS lowest_altitude"
    }
    if (select_list.includes("Highest Altitude")) {
        select_statement += ", MAX(altitude_max) AS highest_altitude"
    }
    if (select_list.includes("Utilities") || utilities) {
        select_statement += `, GROUP_CONCAT(DISTINCT CONCAT(CASE 
                                                                WHEN utility_usage = 1 THEN utility_name 
                                                                WHEN utility_usage = 2 THEN UPPER(utility_name)
                                                            END)) as utility_list`
    }
    console.log(select_list)
    var having = 0
    var and = 0
    var q = select_statement +
            `
            FROM tree
            JOIN climatic_zone
	            ON climatic_zone.tree_id = tree.id
            JOIN climatic
	            ON climatic.id = climatic_zone.climatic_id
            JOIN utility_usage
                ON utility_usage.tree_id = tree.id
            JOIN utility
                ON utility.id = utility_usage.utility_id
            GROUP BY tree.id
           `
    if(rainfall_min) {
        if(having == 0){
            q += "\nHAVING"
            having = 1
        }
        if(and == 1) {
            q += "\nAND"
        } else { and = 1}

        q += ` MIN(rainfall_min) <= "${rainfall_min}"`
    }
    if(rainfall_max) {
        if(having == 0){
            q += "\nHAVING"
            having = 1
        }
        if(and == 1) {
            q += "\nAND"
        } else { and = 1}

        q += ` MAX(rainfall_max) >= "${rainfall_max}"`
    }
    if(altitude_min) {
        if(having == 0){
            q += "\nHAVING"
            having = 1
        }
        if(and == 1) {
            q += "\nAND"
        } else { and = 1}

        q += ` MIN(altitude_min) <= "${altitude_min}"`
    }
    if(altitude_max) {
        if(having == 0){
            q += "\nHAVING"
            having = 1
        }
        if(and == 1) {
            q += "\nAND"
        } else { and = 1}

        q += ` MAX(altitude_max) >= "${altitude_max}"`
    }
    if(utilities){
        if(having == 0){
            q += "\nHAVING"
            having = 1
        }
        if(and == 1) {
            q += "\nAND"
        } else { and = 1}
        for (var count=0; count < utilities.length; count++) {
            if(count > 0){
                q += ` AND`
            }
            q += ` utility_list LIKE "%${utilities[count]}%"`
        }
    }
    q += ` ORDER BY tree.id`
    console.log(q)
    pool.query(q, function(err, results){
        console.log(results)
        res.render('search_result', {title: 'Tree List', select_list: select_list, treeData: results});
        
    });
})

app.post("/search_trees", function(req, res){
    var search_info = {
        rainfall_min: req.body.rainfall_min,
        rainfall_max: req.body.rainfall_max,
        altitude_min: req.body.altitude_min,
        altitude_max: req.body.altitude_max,
        utilities: req.body.utilities,
        select: req.body.select
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
        var count = results[0].count;
        const select_option = ["Minimum Rainfall", "Maximum Rainfall", 
    "Lowest Altitude", "Highest Altitude", "Utilities"];
        const utilities_option = ["Toothbrush", "Toolhandles", "Timber", "Tannins", 
                                "Soil Improvent", "Shelterbelt", "Sandune Fixation", 
                                "Poles", "People Shade", "Nitrogen Fixation", "Medicine",
                                "Livestock Shade", "Live Fencing"]
        //res.send("We have " + count + " users in database");
        res.render('dbms_home', {count: count, select_option: select_option, utilities_option: utilities_option});
    });
});

app.listen(8080, function(){
    console.log("Server running on 8080!");
});