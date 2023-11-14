//*** server 2 shows how a SQL statement received by the server can be executed in
//*** MySQL; the results are send back to the browser via the response command

//*** set up an HTTP server off port 3000
const express = require("express");
const app = express();
const port = 6000;

//*** set up mysql connections
var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "nascar620",  // use your own MySQL root password
    database: "roommate_project"
});

//*** connect to the database
con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

//*** file system module for accessing files in nodejs
const fs = require("fs");
function readAndServe(path, res) {
    fs.readFile(path,function(err, data) {
        res.setHeader('Content-Type', 'text/html');
        res.end(data);
    })
}

//******************************************************************************
//*** this routing table handles all the GET requests from the browser
//******************************************************************************
app.get("/", function (req, res) {
    readAndServe("./login.html",res)

});

app.get("/login", function (req, res) {
    readAndServe("./login.html",res)

});

app.get("/preferences", function (req, res) {
    readAndServe("./preferences.html",res)

});

app.get("/profilePage", function (req, res) {
    readAndServe("./profilePage.html",res)

});

app.get("/profile", function (req, res) {
    readAndServe("./profile.html",res)
});

//******************************************************************************
//*** receive post register data from the client
//******************************************************************************
app.post("/profile", function (req, res) {

    var firstName = req.body.firstName,       // extract the strings received from the browser
        lastName = req.body.lastName,
        email = req.body.email,
        age = req.body.age,
        roommates = req.body.roommates,
        studentYear = req.body.studentYear,
        picture = req.body.picture;

    var sql_query = "insert into users values('" + firstName + "','" + lastName + "','" + email + "','" + age + "','" + roommates + "','" + studentYear + "','" + picture + "')";

    con.query(sql_query, function (err, result, fields) { // execute the SQL string
        if (err)
            res.send("Illegal Query" + err);                  // SQL error

        else {
            console.log(sql_query);                                   // send query results to the console

            res.redirect("http://localhost:3000/preferences");   // redirect to the preferences page
        }
    });
});

/*
//*** the GET string received from the browser will be stored here
var user_string = "";


//*** receive the get request from the client
app.get("/", function (req, res) {
    msg = req.query.user_string;  // extract the CGI variable(s) (SQL query) received from the browser

    con.query(msg, function (err, result, fields) { // execute the SQL string
        if (err) throw err;
        console.log(msg);    // send results to the terminal
        res.send(result);    // send results to the browser
    });
});


//*** wait indefinitely in a loop
app.listen(port, function () {
    console.log("Example app listening on port " + port);
});*/

