const express = require("express");
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const apiRoutes = require("./apiRoutes.js");
const webRoutes = require("./webRoutes.js");


const app = express();
const port = 8080;
app.use(express.json());
app.use(session({
    name: 'ComfySession',
    secret: 'ThisIsASeecret!DoNotReadItOrYouWillBeWanted',
    store: new SQLiteStore,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000, sameSite: true }
}));

app.use(express.static("public"));

app.use('/', webRoutes);
app.use('/api', apiRoutes);

app.listen(port,() => {
    console.log(`servern lyssnar nu på http://localhost:${port}/`);
});
