const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const SECRET_KEY = 'your_jwt_secret_key';

const isValid = (username) => {
  // Check if the username is valid (non-empty and unique)
  return username && !users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  // Check if the username and password match any existing user
  return users.some(user => user.username === username && user.password === password);
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  
  // Generate a token
  const token = jwt.sign({ username: username }, SECRET_KEY, { expiresIn: '1h' });
  //res.send(token);
  return res.json({ token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(403).json({ message: "No token provided" });
  }

  jwt.verify(authorization, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(500).json({ message: "Failed to authenticate token" });
    }

    const username = decoded.username;
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }

    books[isbn].reviews[username] = review;
    return res.json(`The review for the book with ISBN ${isbn} has been added/updated`);
  });
});


// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
const { isbn } = req.params;
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(403).json({ message: "No token provided" });
  }

  jwt.verify(authorization, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(500).json({ message: "Failed to authenticate token" });
    }
  
      const username = decoded.username;
      if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
      }
  
      if (books[isbn].reviews && books[isbn].reviews[username]) {
        delete books[isbn].reviews[username];
        return res.json({ message: "Review deleted", reviews: books[isbn].reviews });
      } else {
        return res.status(404).json(`Reviews for the book with ISBN ${isbn} posted by the user ${username} deleted`);
      }
    });
  });
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
