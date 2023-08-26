const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");
const encoder = bodyParser.urlencoded();
const app = express();
const port = 5050;

app.use("/images",express.static('images'));
app.use("/css",express.static('css'));
app.use("/js",express.static('js'));


const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "project-3",
});

connection.connect(function (error) {
  if (error) {
    console.error("Error connecting to database:", error);
    throw error;
  }
  console.log("Connected to the database");
});

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/login", function (req, res) {
  res.sendFile(__dirname + "/login.html");
});

app.post("/login", encoder, function (req, res) {
  const email_address = req.body.email_address;
  const password = req.body.password;

  connection.query(
    "SELECT * FROM user WHERE email_address = ? AND password = ?",
    [email_address, password],
    function (error, results, fields) {
      if (error) {
        console.error("Error executing query:", error);
        return res.status(500).send("Internal Server Error");
      }

      if (results.length > 0) {
        res.redirect("/home");
      } else {
        res.redirect("/");
      }
    }
  );
});

app.get("/home", function (req, res) {
  res.sendFile(__dirname + "/home.html");
});

app.get("/signup", function (req, res) {
  res.sendFile(__dirname + "/sign-up.html");
});

app.post("/signup", encoder, function (req, res) {
  const username = req.body.username;
  const email_address = req.body.email_address;
  const password = req.body.password;

  // Perform validation on the input data
  if (!username || !email_address || !password) {
    return res.status(400).send("All fields are required.");
  }

  // Check if the username already exists
  connection.query(
    "SELECT * FROM user WHERE username = ?",
    [username],
    function (error, results, fields) {
      if (error) {
        console.error("Error executing username check query:", error);
        return res.status(500).send("Internal Server Error");
      }

      if (results.length > 0) {
        return res.status(409).send("Username already exists.");
      }

      // Insert new user into the database
      connection.query(
        "INSERT INTO user (username, email_address, password) VALUES (?, ?, ?)",
        [username, email_address, password],
        function (error, results, fields) {
          if (error) {
            console.error("Error executing signup query:", error);
            return res.status(500).send("Internal Server Error");
          }

          res.redirect("/home");
        }
      );
    }
  );
});

app.get("/home_member", function (req, res) {
  res.sendFile(__dirname + "/home_member.html");
});

app.listen(port, function () {
  console.log(`Server is running on http://localhost:${port}`);
});
