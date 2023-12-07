const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
const mysql = require('mysql');
const fs = require("fs");

const session = require('express-session');

app.use(session({
    secret: 'your-secret-key',
    resave: true,
    saveUninitialized: true
}));

app.listen(port, function () {
    console.log("NodeJS app listening on port " + port);
});

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "nascar620",
    database: "roommate_project"
});

con.connect(function (err) {
    if (err)
        throw err;
    console.log("Connected to MySQL");
});

function readAndServe(path, res, data = {}) {
    fs.readFile(path, function (err, fileContent) {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }

        res.setHeader('Content-Type', 'text/html');

        // Inject the dynamic data into the HTML content
        let modifiedData = fileContent.toString();
        for (const key in data) {
            const regex = new RegExp(`<!-- ${key} -->`, 'g');
            modifiedData = modifiedData.replace(regex, data[key]);
        }

        res.end(modifiedData);
    });
}


// Main Menu
app.get("/", function (req, res) {
    readAndServe("./register.html", res);
});

app.get("/registerConf", function (req, res) {
    readAndServe("./registerConf.html", res);
});

// Login Page
app.get("/login", function (req, res) {
    readAndServe("./login.html", res);
});

// about Me Page
app.get("/aboutMe", function (req, res) {
    readAndServe("./aboutMe.html", res);
});


// Server code
app.post("/register", function (req, res) {
    const { username, password, action } = req.body;

    if (action === 'register') {
        // Check if the username already exists
        const checkUserQuery = "SELECT * FROM users_create WHERE username = ?";
        con.query(checkUserQuery, [username], function (err, result) {
            if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
                return;
            }

            if (result.length > 0) {
                // Username already exists, send an error message
                const errorMessage = 'Account already created with this username';
                const backButton = '<br><a href="/"><button>Back to Register Page</button></a>';
                const styledError = `<div style="color: red; font-weight: bold;">${errorMessage}</div>${backButton}`;
                res.status(400).send(styledError);
            } else {
                // Username is unique, proceed with registration
                const insertUserQuery = "INSERT INTO users_create (username, Password) VALUES (?, ?)";
                con.query(insertUserQuery, [username, password], function (err, result) {
                    if (err) {
                        console.error(err);
                        res.status(500).send('Internal Server Error');
                        return;
                    }
                    // Redirect to the userRecipes page after successful registration
                    res.redirect("/registerConf");
                });
            }
        });
    } else if (action === 'login') {
        // Redirect to the login page
        res.redirect("/login");
    } else {
        // Handle other cases
        res.status(400).send('Bad Request');
    }
});


app.post("/login", function (req, res) {
    const { username, password } = req.body;

    // Check if the user exists in the 'users' table
    const sql_query = "SELECT * FROM users_create WHERE username = ? AND Password = ?";
    con.query(sql_query, [username, password], function (err, result) {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }

        if (result.length > 0) {
            // Login successful
            console.log("Login successful:", username);

            // Set the username in the session
            req.session.username = username;

            // Check if the user has filled out the aboutMe page
            const checkAboutMeQuery = "SELECT * FROM about_me WHERE username = ?";
            con.query(checkAboutMeQuery, [username], function (err, aboutMeResult) {
                if (err) {
                    console.error(err);
                    res.status(500).send('Internal Server Error');
                    return;
                }

                if (aboutMeResult.length > 0) {
                    // User has filled out aboutMe page, set the session variable to true
                    req.session.aboutMeCompleted = true;

                    // Redirect to the main page
                    res.redirect("/main");
                } else {
                    // User has not filled out aboutMe page, set the session variable to false
                    req.session.aboutMeCompleted = false;

                    // Redirect to the aboutMe page
                    res.redirect("/aboutMe");
                }
            });
        } else {
            // Login failed
            console.log("Login failed:", username);

            // Display error message on the login page
            const errorMessage = 'Incorrect Credentials';
            const styledError = `<div style="color: red; font-weight: bold;">${errorMessage}</div>`;

            // Render the login page with the error message
            readAndServe("./login.html", res, styledError);
        }
    });
});



// ...

// Main Page
app.get("/main", function (req, res) {
    // Check if the user is logged in
    if (!req.session.username) {
        // Redirect to the login page if not logged in
        res.redirect("/login");
        return;
    }

    const loggedInUsername = req.session.username;

    // Fetch information about the logged-in user
    const getLoggedInUserInfoQuery = "SELECT * FROM about_me WHERE username = ?";
    con.query(getLoggedInUserInfoQuery, [loggedInUsername], function (err, loggedInUserInfo) {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }

        // Fetch information about other users
        const getOtherUsersInfoQuery = "SELECT * FROM about_me WHERE username <> ?";
        con.query(getOtherUsersInfoQuery, [loggedInUsername], function (err, otherUsersInfo) {
            if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
                return;
            }

            // Generate HTML with dynamic data and styles
            const html = `
                <!DOCTYPE html>
                <html lang="en">
                
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Main Page</title>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            background-color: #f8f8f8;
                            margin: 0;
                            padding: 0;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            min-height: 100vh;
                            color: #333;
                        }

                        h2, h3, p {
                            margin: 0;
                        }

                        h2 {
                            color: #76aaea; /* Change to the color from login.html */
                            margin-bottom: 10px;
                        }

                        .main-container {
                            width: 80%;
                            max-width: 800px;
                            margin: 20px auto;
                            background-color: #fff;
                            padding: 20px;
                            border-radius: 8px;
                            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                            display: flex;
                            flex-wrap: wrap;
                            position: relative;
                        }

                        .user-info {
                            flex: 1;
                            margin-right: 10px;
                            position: sticky;
                            top: 0;
                        }
                
                        .other-users {
                            flex: 1;
                            overflow-y: auto;
                            max-height: 80vh; /* Set a maximum height for scrolling */
                        }

                        .search-bar {
                            position: absolute;
                            top: 10px;
                            right: 10px;
                            text-align: right;
                        }

                        .search-bar form {
                            display: inline-block;
                        }

                        .search-bar label,
                        .search-bar input,
                        .search-bar button {
                            margin: 5px;
                        }

                        .user-info, .other-users {
                            width: 100%;
                            box-sizing: border-box;
                            padding: 15px;
                            border: 1px solid #ddd;
                            border-radius: 8px;
                            background-color: #f9f9f9;
                            margin-bottom: 20px;
                            position: relative;
                        }

                        .user-info {
                            flex: 1;
                            margin-right: 10px;
                        }

                        .other-users {
                            flex: 1;
                            margin-left: 10px;
                        }

                        .other-user {
                            margin-bottom: 20px;
                            padding: 15px;
                            border: 1px solid #ddd;
                            border-radius: 8px;
                            background-color: #f9f9f9;
                            position: relative;
                        }

                        .view-profile-button {
                            position: absolute;
                            top: 10px;
                            right: 10px;
                            background-color: #76aaea;
                            color: white;
                            padding: 8px 16px;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 1em;
                        }

                        .view-profile-button:hover {
                            background-color: #5E88BB;
                        }

                        .search-bar {
                            position: absolute;
                            top: 10px;
                            right: 10px;
                            text-align: right;
                            z-index: 1; /* Ensure the search bar is above other elements */
                        }
                        
                        .search-bar form {
                            display: inline-block;
                            background-color: #fff; /* Set a background color to make it stand out */
                            padding: 10px;
                            border-radius: 4px;
                            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        }
                        
                        .search-bar label,
                        .search-bar input,
                        .search-bar button {
                            margin: 5px;
                        }
                    </style>
                </head>
            
                <body>
                    <!-- Add the search bar here -->
                    <div class="search-bar">
                        <form action="/search" method="get">
                            <label for="username">Search User:</label>
                            <input type="text" id="username" name="username" required>
                            <button type="submit">Search</button>
                        </form>
                    </div>

                    <div class="main-container">
                        <!-- Left half: Display information about the logged-in user -->
                        <div class="user-info">
                            <h2>Welcome, ${loggedInUserInfo[0].username}!</h2>
                            <p>First Name: ${loggedInUserInfo[0].first_name}</p>
                            <p>Last Name: ${loggedInUserInfo[0].last_name}</p>
                            <p>Age: ${loggedInUserInfo[0].age}</p>
                            <p>Roommate Amount: ${loggedInUserInfo[0].roommate_amount}</p>
                            <p>Student Level: ${loggedInUserInfo[0].student_level}</p>
                            <p>About Me: ${loggedInUserInfo[0].about_text}</p>
                            <form action="/savePreferences" method="post">
                            <label>
                            <input type="checkbox" name="preference" value="NoSnoring" ${loggedInUserInfo[0].preferences.includes('NoSnoring') ? 'checked' : ''}> No Snoring
                            </label>
                            <label>
                            <input type="checkbox" name="preference" value="NightOwl" ${loggedInUserInfo[0].preferences.includes('NightOwl') ? 'checked' : ''}> Night Owl
                            </label>
                            <label>
                            <input type="checkbox" name="preference" value="Quiet" ${loggedInUserInfo[0].preferences.includes('Quiet') ? 'checked' : ''}> Quiet Roommate
                            </label>
                            <!-- Add more checkboxes as needed -->
                        
                            <button type="submit">Save Preferences</button>
                        </form>
                        </div>
                
                        <!-- Right half: Display information about other users -->
                        <div class="other-users">
                            <h3>Other Users:</h3>
                            <!-- Add other-user entries as needed -->
                            ${otherUsersInfo.map(user => `
                                <div class="other-user">
                                    <h2>${user.username}</h2>
                                    <p>First Name: ${user.first_name}</p>
                                    <p>Last Name: ${user.last_name}</p>
                                    <p>Age: ${user.age}</p>
                                    <p>Roommate Amount: ${user.roommate_amount}</p>
                                    <p>Student Level: ${user.student_level}</p>
                                    <p>About Me: ${user.about_text}</p>
                                    <!-- View Profile button for each other user -->
                                    <button class="view-profile-button" onclick="viewProfile('${user.username}')">View Profile</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <script>
                        // Function to redirect to the view profile page
                        function viewProfile(username) {
                            window.location.href = "/profile/" + username;
                        }
                    </script>
                </body>
                
                </html>
            `;

            // Send the HTML as the response
            res.send(html);
        });
    });
});


app.get("/search", function (req, res) {
    const searchUsername = req.query.username;

    // Fetch information about the user with the specified username
    const getSearchUserInfoQuery = "SELECT * FROM about_me WHERE username = ?";
    con.query(getSearchUserInfoQuery, [searchUsername], function (err, searchUserInfo) {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }

        if (searchUserInfo.length > 0) {
            // User found, redirect to their profile page
            res.redirect(`/profile/${searchUserInfo[0].username}`);
        } else {
            // User not found, display a message on the main page
            res.send(`<p>User "${searchUsername}" not found.</p><a href="/main">Back to Main Page</a>`);
        }
    });
});


app.get("/profile/:username", function (req, res) {
    const profileUsername = req.params.username;

    // Fetch information about the user with the specified username
    const getProfileInfoQuery = "SELECT * FROM about_me WHERE username = ?";
    con.query(getProfileInfoQuery, [profileUsername], function (err, profileInfo) {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }

        // Generate HTML for the profile page with updated styling
        const html = `
            <!DOCTYPE html>
            <html lang="en">
            
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${profileInfo[0].username}'s Profile</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background-color: #f8f8f8;
                        margin: 0;
                        padding: 0;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        color: #333;
                    }

                    h2, p {
                        margin: 0;
                    }

                    h2 {
                        color: #76aaea; /* Match the color from login.html */
                        margin-bottom: 10px;
                    }

                    .profile-container {
                        width: 80%;
                        max-width: 600px;
                        margin: 20px auto;
                        background-color: #fff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        text-align: center;
                    }

                    .profile-info {
                        margin-bottom: 20px;
                    }

                    .back-to-main {
                        margin-top: 20px;
                    }

                    .back-to-main a {
                        color: #76aaea; /* Match the color from login.html */
                        text-decoration: none;
                        font-weight: bold;
                    }

                    .back-to-main a:hover {
                        text-decoration: underline;
                    }
                    .match-button {
                        background-color: #76aaea; /* for the Match button */
                        color: white;
                        padding: 8px 16px;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 1em;
                    }

                    .match-button:hover {
                        background-color: #76aaea; /* Darker green color on hover */
                    }
                </style>
                </head>
            
                <body>
                    <div class="profile-container">
                        <h2>${profileInfo[0].username}'s Profile</h2>
                        <div class="profile-info">
                            <p>First Name: ${profileInfo[0].first_name}</p>
                            <p>Last Name: ${profileInfo[0].last_name}</p>
                            <p>Age: ${profileInfo[0].age}</p>
                            <p>Roommate Amount: ${profileInfo[0].roommate_amount}</p>
                            <p>Student Level: ${profileInfo[0].student_level}</p>
                            <p>About Me: ${profileInfo[0].about_text}</p>
                        </div>
                        <div class="back-to-main">
                            <a href="/main">Back to Main Page</a>
                        </div>
                    </div>
                    <!-- Add the Match button here -->
                    <button class="match-button" onclick="redirectToMatched('${profileInfo[0].username}')">Match</button>
                </body>
                
                <script>
                    // Function to redirect to the matched.html page with the matched username
                    function redirectToMatched(username) {
                        window.location.href = "/matched?username=" + encodeURIComponent(username);
                    }
                </script>
    
                </html>
            `;

        // Send the HTML as the response
        res.send(html);
    });
});

// ...




app.post("/aboutMe", function (req, res) {
    const { first_name, last_name, age, roommate_amount, student_level, about_text } = req.body;

    // Check if the user is logged in (you can customize this based on your session management)
    if (!req.session.username) {
        // Redirect to the login page if not logged in
        res.redirect("/login");
        return;
    }

    const username = req.session.username;

    // Update the about_me table with the user's information
    const updateAboutMeQuery = `
        INSERT INTO about_me (username, first_name, last_name, age, roommate_amount, student_level, about_text)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        first_name = VALUES(first_name),
        last_name = VALUES(last_name),
        age = VALUES(age),
        roommate_amount = VALUES(roommate_amount),
        student_level = VALUES(student_level),
        about_text = VALUES(about_text)
    `;

    con.query(
        updateAboutMeQuery,
        [username, first_name, last_name, age, roommate_amount, student_level, about_text],
        function (err, result) {
            if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
                return;
            }

            // Set the aboutMeCompleted session variable to true
            req.session.aboutMeCompleted = true;

            // Redirect to the main page after successful update
            // res.redirect("/main");
        }
    );
});





// ...



function readAndServe(path, res, errorMessage = '') {
    fs.readFile(path, function (err, data) {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.setHeader('Content-Type', 'text/html');
        // Inject the error message into the HTML content
        const modifiedData = data.toString().replace('<!-- Error Message Placeholder -->', errorMessage);
        res.end(modifiedData);
    });
}

app.get("/matched", function (req, res) {
    // Get the matched username from the query parameters
    const matchedUsername = req.query.username;

    // Render the matchedUser.html page with the matched username
    readAndServe("./matched.html", res, { matchedUsername });
});



// Handle Match button click
app.post("/match", function (req, res) {
    // Redirect to the matchedUser page
    res.redirect("/matched");
});

app.post("/savePreferences", function (req, res) {
    const newPreferences = Array.isArray(req.body.preference) ? req.body.preference : [req.body.preference];
    const username = req.session.username;

    // Fetch existing preferences for the user
    const fetchPreferencesQuery = "SELECT preference_name FROM preferences WHERE username = ?";
    con.query(fetchPreferencesQuery, [username], function (err, existingPreferences) {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }

        // Extract the existing preferences from the result
        const currentPreferences = existingPreferences.map(pref => pref.preference_name);

        // Identify preferences to be deleted (in existing but not in new)
        const preferencesToDelete = currentPreferences.filter(pref => !newPreferences.includes(pref));

        // Identify preferences to be inserted (in new but not in existing)
        const preferencesToInsert = newPreferences.filter(pref => !currentPreferences.includes(pref));

        // Delete preferences that are no longer selected
        if (preferencesToDelete.length > 0) {
            const deletePreferencesQuery = "DELETE FROM preferences WHERE username = ? AND preference_name IN (?)";
            con.query(deletePreferencesQuery, [username, preferencesToDelete], function (err, deleteResult) {
                if (err) {
                    console.error(err);
                    res.status(500).send('Internal Server Error');
                    return;
                }
            });
        }

        // Insert new preferences
        if (preferencesToInsert.length > 0) {
            const insertPreferencesQuery = "INSERT INTO preferences (username, preference_name) VALUES ?";
            const preferenceValues = preferencesToInsert.map(preference => [username, preference]);
            con.query(insertPreferencesQuery, [preferenceValues], function (err, insertResult) {
                if (err) {
                    console.error(err);
                    res.status(500).send('Internal Server Error');
                    return;
                }
            });
        }

        // Redirect to the main page after successful update
        res.redirect("/main");
    });
});



