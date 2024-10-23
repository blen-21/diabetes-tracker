// jshint esversion:6
const express = require("express");
const path = require("path");
const app = express();
const ejs = require("ejs");
const { User, SugarLog } = require('./mongodb');
const session = require("express-session");
const bcrypt = require("bcrypt");
const saltRounds = 10;

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "../public")));

app.use(session({
    secret: 'aS3cUrE@!k3Y$!forSession1234$%#&',    //to generate a cryptographic hash (HMAC) for the session ID
    resave: false,     //the session is only saved if it has been modified.
    saveUninitialized: true,           //new but unmodified sessions will still be saved in the session store.
    cookie: { secure: false }    //session cookie can be sent over both HTTP and HTTPS.
}));

// Route to render the home page
app.get("/", (req, res) => {
    res.render("home");
});
app.get("/home", (req, res) => {
    res.render("home");
});

// Route to render the signup page
app.get("/signup", (req, res) => {
    res.render("signup");
});

// Route to render the login page
app.get("/login", (req, res) => {
    res.render("login");
});

// Route to render the diabetes page
app.get("/diabetes", (req, res) => {
    res.render("diabetes");
});

// Route to render the contact page
app.get("/contact", (req, res) => {
    res.render("contact");
});

// Route to render the form page
app.get("/form", (req, res) => {
    const username = req.session.user.name;
    res.render("form", { username: username });
});
// Route to render the medication page
app.get("/medication", (req,res) =>{
    res.render("medication");
});
//Route to render the sugar log page
app.get("/log", (req,res) =>{
    res.render("log");
});
//Route to render the nutrition page
app.get('/nutrition', (req,res) =>{
    res.render('nutrition');
});
//Route to render the exercise log page
app.get('/exercise', (req,res) =>{
    res.render('exercise');
});
//Route to render the faq page
app.get("/faq", (req, res) => {
    const faqData = [
        {
            question: "What is diabetes?",
            answer: "Diabetes is a chronic condition that affects how your body turns food into energy."
        },
        {
            question: "What are the different types of diabetes?",
            answer: "The main types of diabetes are Type 1, Type 2, and gestational diabetes."
        },
        {
            question: "What are the symptoms of diabetes?",
            answer: "Common symptoms include frequent urination, increased thirst, extreme fatigue, and blurred vision."
        },
        {
            question: "How is diabetes managed?",
            answer: "Diabetes can be managed through medication, insulin therapy, a healthy diet, and regular physical activity."
        },
        {
            question: "What are the complications of untreated diabetes?",
            answer: "Untreated diabetes can lead to complications like heart disease, kidney failure, and nerve damage."
        },
        {
            question: "What causes Type 1 diabetes?",
            answer: "Type 1 diabetes is caused by an autoimmune reaction that destroys insulin-producing cells in the pancreas."
        },
        {
            question: "What causes Type 2 diabetes?",
            answer: "Type 2 diabetes is primarily caused by insulin resistance and is often associated with obesity and a sedentary lifestyle."
        },
        {
            question: "What is gestational diabetes?",
            answer: "Gestational diabetes is a type of diabetes that occurs during pregnancy and usually disappears after childbirth, but increases the risk of developing Type 2 diabetes later."
        },
        {
            question: "How can I prevent Type 2 diabetes?",
            answer: "Preventing Type 2 diabetes involves maintaining a healthy weight, eating a balanced diet, staying physically active, and avoiding smoking."
        },
        {
            question: "Can diabetes be cured?",
            answer: "Currently, there is no cure for diabetes, but it can be effectively managed with lifestyle changes, medication, and regular monitoring."
        },
        {
            question: "What is a normal blood sugar level?",
            answer: "A normal blood sugar level varies depending on when you last ate, but typically ranges from 70-130 mg/dL before meals and less than 180 mg/dL after meals."
        },
        {
            question: "What should I do if my blood sugar is too high?",
            answer: "If your blood sugar is too high, you should follow your healthcare provider's advice, which may include adjusting medication, increasing physical activity, and modifying your diet."
        },
        {
            question: "Can I drink alcohol if I have diabetes?",
            answer: "Alcohol can affect blood sugar levels, so it’s important to drink in moderation and monitor your blood sugar levels closely."
        },
        {
            question: "How often should I check my blood sugar levels?",
            answer: "The frequency of blood sugar monitoring depends on your treatment plan and individual needs, but it’s generally recommended to check regularly, especially if you’re on insulin or other medications."
        },
        {
            question: "What is an HbA1c test?",
            answer: "An HbA1c test measures your average blood sugar level over the past 2-3 months and is used to assess how well your diabetes is being managed."
        },
        {
            question: "What is diabetic ketoacidosis (DKA)?",
            answer: "Diabetic ketoacidosis (DKA) is a serious complication of diabetes that occurs when the body starts breaking down fat at an excessive rate, leading to a buildup of ketones in the blood."
        },
        {
            question: "What are the long-term effects of diabetes?",
            answer: "Long-term effects of diabetes can include cardiovascular disease, nerve damage, kidney damage, eye damage, and increased risk of infections."
        }
    ]; 
    res.render("faq", { faqData: faqData });
});
app.get('/chat', (req,res) =>{
    res.render('chat');
});
//Route to render the profile page
app.get('/profile', async (req, res) => {
    try {
        const user = await User.findOne({ name: req.query.username });
        if (!user) {
            return res.status(404).send("User not found.");
        }
        else{
            res.render('profile', {
                username: user.name,
                fname: user.fname,
                lname: user.lname,
                age: user.age,
                gender: user.gender,
                diseases: user.diseases || []
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send('An error occurred.');
    }
});

app.get('/submit-form', (req, res) => {
    res.redirect(`/form?username=${req.session.user.name}`);
});

app.get("/logout", (req, res) => {
    //  destroying the session
    req.session.destroy((err) => {
        if (err) {
            return res.redirect("/profile");
        }
        // Clear the cookie
        res.clearCookie("connect.sid");
        
        // Redirect to the home page after logging out
        res.redirect("/home");
    });
});
app.post("/signup", async (req, res) => {
    try {
        const { name, password, confirmPassword } = req.body;

        // Checking if the user already exists
        const existingUser = await User.findOne({ name: name });
        if (existingUser) {
            return res.render("signup", { error: "Username already taken, please choose another one." });
        }

        // Checking if passwords match
        if (password !== confirmPassword) {
            return res.render("signup", { error: "Passwords do not match. Please try again." });
        }

        // Password validation: At least 8 characters, containing both letters and numbers
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.render("signup", { error: "Password must be at least 8 characters long and contain both letters and numbers." });
        }

        // Hashing the password
        const saltRounds = 10; // Define saltRounds
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Creating a new user document
        const newUser = new User({

            name: name,
            password: hashedPassword
        });

        // Saving the new user to the database
        await newUser.save();

        // Storing user data in the session (automatic login)
        req.session.user = {
            userId: newUser._id,
            name: newUser.name,
        };
         
      if(newUser){
        req.session.userId = newUser._id,
        console.log('User logged in with ID:', req.session.userId);
    }

        // Redirecting to the form page after signup
        res.redirect(`/form`);

    } catch (error) {
        console.log(error);
        res.render("signup", { error: "An error occurred during signup. Please try again." });
    }
});

// Handling login form submission
app.post("/login", async (req, res) => {
    try {
        // Finding the user by name
        const user = await User.findOne({ name: req.body.name });
        
        if (user) {
            // Comparing the entered password with the hashed password in the database
            const isMatch = await bcrypt.compare(req.body.password, user.password);
            
            if (isMatch) {
                //storing the data in to the session
                
                    req.session.userId = user._id,
                    req.session.name = user.name,
                    req.session.email = user.email,
                    req.session.fname = user.email,
                    req.session.lname = user.lname
                    console.log('User logged in with ID:', req.session.userId);

                
                // If Passwords match, redirecting to the profile page
                res.redirect(`/profile?username=${user.name}`);
            } else {
                // If Passwords do not match
                res.render("login", { error: "Incorrect password. Please try again." });
            }
        } else {
            // If User not found
            res.render("login", { error: "User not found. Please check your username." });
        }
    } catch (error) {
        console.log(error);
        res.render("login", { error: "An error occurred during login. Please try again." });
    }
});
app.post("/submit-form", async (req, res) => {
    try {
        const { fname, lname, diseases, age, gender } = req.body;
        const username = req.session.user.name; 

        // Finding the user by their username
        const user = await User.findOne({ name: username });

        if (!user) {
            return res.render("form", { error: "User not found. Please sign up first." });
        }

        // Updating the user's document with the additional information
        user.fname = fname;
        user.lname = lname;
        user.diseases = diseases || []; // Default to an empty array if no diseases are selected
        user.age = age;
        user.gender = gender;
        // Saving the updated document
        await user.save();

                // Storing the additional data in the session
                req.session.user.fname = fname;
                req.session.user.lname = lname;
                req.session.user.diseases = diseases;
                req.session.user.age = age;
                req.session.user.gender = gender;
            
        // Redirecting to the profile page
        res.redirect(`/profile?username=${user.name}`);
    } catch (error) {
        console.log(error);
        res.render("form", { error: "An error occurred while submitting the form. Please try again." });
    }
});
//edit profile
app.post('/edit-profile', async (req, res) => {
    const { username, fname, lname, age, gender } = req.body;
  
    const updateFields = {};
    if (fname) updateFields.fname = fname;
    if (lname) updateFields.lname = lname;
    if (age) updateFields.age = age;
    if (gender) updateFields.gender = gender;
  
    try {
      const result = await User.findOneAndUpdate({ username }, updateFields, { new: true });
      if (result) {
        res.send('Profile updated successfully');
      } else {
        res.send('User not found');
      }
    } catch (error) {
      console.error(error);
      res.send('An error occurred while updating the profile');
    }
  });
  
app.get('/log-sugar', (req, res) => {
    res.render('log');  
});

// POST route to log sugar levels
app.post('/log-sugar', async (req, res) => {
    try {
        // Check if the user is logged in (i.e., user ID exists in session)
        if (!req.session.userId) {
            return res.status(401).send('Unauthorized: Please log in');
        }

        const userId = req.session.userId;  // Get user ID from session

        // Capture data from req.body
        const { sugarLevel, timeOfDay, notes } = req.body;

        // Create a new SugarLog entry
        const sugarLog = new SugarLog({
            sugarLevel,
            timeOfDay,
            notes,
            user: userId  // Linking the sugar log to the user
        });

        await sugarLog.save();

        // Updating the user with the new sugar log
        const user = await User.findById(userId);
        user.sugarLogs.push(sugarLog._id);
        await user.save();

        res.redirect(`/profile?username=${user.name}`); // Redirect to user's profile page
    } catch (err) {
        console.error('Error saving sugar log:', err);
        res.status(500).send('Server Error');
    }
});


// Starting the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
