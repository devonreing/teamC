CREATE TABLE Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(20), 
    Password VARCHAR (20),
    Email VARCHAR(50)  
);

CREATE TABLE Sleeping_Preferences (
    SleepID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT,
    SleepType VARCHAR(50),
    Bedtime VARCHAR(50),
    WakeTime VARCHAR(50),
    SleepTemp INT, -- Assuming you store temperature as an integer
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

CREATE TABLE Living_Habits (
    HabitID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT,
    Budget DECIMAL(10, 2),
    Cleanliness VARCHAR(50),
    AcceptPets VARCHAR(3), 
    DayTemp INT,          
    QuietPreference VARCHAR(50),
    AcceptSubstances VARCHAR(50),
    CookingPlans VARCHAR(50),
    SharingPreferences VARCHAR(255), 
    GuestFrequency VARCHAR(50),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

CREATE TABLE Personality (
    PersonalityID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT,
    IntroExtroAmbi VARCHAR(50),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);
