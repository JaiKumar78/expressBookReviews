const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!isValid(username)) {
    return res.status(400).json({ message: "Invalid or already taken username" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
  try{
    await res.status(200).json(books);
  }
  catch(err){
    await res.status(404).json({message : err.message});
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const { isbn } = req.params;
  

  // if (books[isbn]) {
  //   return res.json(books[isbn]);
  // }

  // return res.status(404).json({ message: "Book not found" });
});

// Get book details based on author
public_users.get('/author/:author', (req, res) => {
  const { author } = req.params;
  const filteredBooks = Object.values(books).filter(book => book.author === author);

  if (filteredBooks.length > 0) {
    return res.json(filteredBooks);
  }

  return res.status(404).json({ message: "No books found by this author" });
});

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
  const { title } = req.params;
  const filteredBooks = Object.values(books).filter(book => book.title === title);

  if (filteredBooks.length > 0) {
    return res.json(filteredBooks);
  }

  return res.status(404).json({ message: "No books found with this title" });
});

// Get book review
public_users.get('/review/:isbn', (req, res) => {
  const { isbn } = req.params;

  if (books[isbn]) {
    return res.json(books[isbn].reviews);
  }

  return res.status(404).json({ message: "Book not found" });
});

module.exports.general = public_users;
