const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Set up mysql connections
const mysql = require('mysql');
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "nascar620",
    database: "roommate_project"
});

// Connect to the database
con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

// Function to read and serve HTML files
function readAndServe(path, res) {
    fs.readFile(path, function (err, data) {
        res.setHeader('Content-Type', 'text/html');
        res.end(data);
    });
}

// Routes
app.get("/", function (req, res) {
    readAndServe("./login.html", res);
});

app.get("/login", function (req, res) {
    readAndServe("./login.html", res);
});

app.get("/preferences", function (req, res) {
    readAndServe("./preferences.html", res);
});

app.get("/profilePage", function (req, res) {
    // Extract username from the query parameter
    const first_name = req.query.first_name;

    // Fetch user data from the database based on the username
    const sql_query = "SELECT * FROM users_create WHERE first_name = ?";
    con.query(sql_query, [first_name], function (err, result) {
        if (err) {
            res.send("Error: " + err);
        } else {
            console.log("User data retrieved:", result[0]); // Add this line for debugging
            // Pass user data to the profilePage.html
            res.sendFile(path.join(__dirname, '/profilePage.html'));
        }
    });
});

app.get("/profile", function (req, res) {
    readAndServe("./profile.html", res);
});

app.post("/profile", function (req, res) {
    // Extract user details from the request body
    const username = req.body.username;
    const Password = req.body.Password;
    const about = req.body.about;
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const Email = req.body.Email;
    const age = req.body.age;
    const roommate_amount = req.body.roommate_amount;
    const student_level = req.body.student_level;

    // Assuming your 'users_create' table has columns: username, about, first_name, last_name, Email, age, roommate_amount, student_level
    const sql_query = "INSERT INTO users_create (username,Password, about, first_name, last_name, Email, age, roommate_amount, student_level) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [username, Password, about, first_name, last_name, Email, age, roommate_amount, student_level];

    con.query(sql_query, values, function (err, result, fields) {
        if (err) {
            res.send("Error: " + err);
        } else {
            // After successful user creation, redirect to the updateProfile page
            res.redirect("/updateProfile?username=" + username);
        }
    });
});








// Similar to the /show route, add the /updateProfile route
// Similar to the /show route, add the /updateProfile route
app.get("/updateProfile", function (req, res) {
    const username = req.query.username; // extract the string received from the browser

    const sql_query = "SELECT * FROM users_create WHERE username = '" + username + "'";

    con.query(sql_query, function (err, result, fields) { // execute the SQL string
        if (err) {
            console.error("Error executing SQL query:", err);
            res.send("Error: " + err);
        } else {
            if (result && result.length > 0) {
                //*** start creating the html body for the browser
                var html_body = "<HTML><STYLE>body{font-family:arial}</STYLE>";
                html_body = html_body + "<BODY>";

                //*** prints user information
                html_body = html_body + "<h1>User Profile</h1>";
                html_body = html_body + "<p><b>Username: </b>" + result[0].username + "</p>";
                html_body = html_body + "<p><b>About Me: </b>" + result[0].about + "</p>";
                html_body = html_body + "<p><b>First Name: </b>" + result[0].first_name + "</p>";
                html_body = html_body + "<p><b>Last Name: </b>" + result[0].last_name + "</p>";
                html_body = html_body + "<p><b>Email: </b>" + result[0].Email + "</p>";
                html_body = html_body + "<p><b>Age: </b>" + result[0].age + "</p>";
                html_body = html_body + "<p><b>Roommate Amount: </b>" + result[0].roommate_amount + "</p>";
                html_body = html_body + "<p><b>Student Level: </b>" + result[0].student_level + "</p>";

                html_body = html_body + "<BR><BR><BR><a href=http://localhost:3000/>Main Menu</a><BR><BR><BR>";
                html_body = html_body + "</BODY></HTML>";

                console.log(html_body);             // send query results to the console
                res.send(html_body);                // send query results back to the browser
            } else {
                res.send("User not found");
            }
        }
    });
});





app.listen(port, function () {
    console.log("Server is running on port " + port);
});
