use roommate_project;
CREATE TABLE Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(255) NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL,
    FirstName VARCHAR(50),
    LastName VARCHAR(50),
    Description TEXT
);

CREATE TABLE RoommatePreferences (
    PreferenceID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT,
    MinAge INT,
    MaxAge INT,
    GenderPreference ENUM('Male', 'Female', 'Any'),
    SmokingPreference ENUM('Non-smoker', 'Smoker', 'No preference'),
    PetPreference ENUM('No pets', 'Cats', 'Dogs', 'Other', 'No preference'),
    FOREIGN KEY (UserID) REFERENCES Users (UserID)
);

CREATE TABLE LikesDislikes (
    LikeDislikeID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT,
    Likes TEXT, 
    Dislike TEXT,
    FOREIGN KEY (UserID) REFERENCES Users (UserID)
);

CREATE TABLE Matches (
    MatchID INT AUTO_INCREMENT PRIMARY KEY,
    User1ID INT,
    User2ID INT,
    MatchScore DECIMAL(5, 2),
    FOREIGN KEY (User1ID) REFERENCES Users (UserID),
    FOREIGN KEY (User2ID) REFERENCES Users (UserID)
);

