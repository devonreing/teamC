-- Create the Users table
CREATE TABLE Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(255), -- You can adjust the data types as needed
    Email VARCHAR(255)     -- You can adjust the data types as needed
);

-- Create the Sleeping_Preferences table
CREATE TABLE Sleeping_Preferences (
    SleepID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT,
    SleepType VARCHAR(50),
    Bedtime VARCHAR(50),
    WakeTime VARCHAR(50),
    SleepTemp INT, -- Assuming you store temperature as an integer
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Create the Living_Habits table
CREATE TABLE Living_Habits (
    HabitID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT,
    Budget DECIMAL(10, 2), -- Adjust the precision and scale as needed
    Cleanliness VARCHAR(50),
    AcceptPets VARCHAR(3), -- Use VARCHAR(3) to store "yes" or "no"
    DayTemp INT,           -- Assuming you store temperature as an integer
    QuietPreference VARCHAR(50),
    AcceptSubstances VARCHAR(50),
    CookingPlans VARCHAR(50),
    SharingPreferences VARCHAR(255), -- You can adjust the data type as needed
    GuestFrequency VARCHAR(50),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Create the Personality table
CREATE TABLE Personality (
    PersonalityID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT,
    IntroExtroAmbi VARCHAR(50),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);
