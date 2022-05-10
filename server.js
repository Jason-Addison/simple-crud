const express = require('express');
const fs = require('fs');

const app = express();

app.use(express.static("public"));
app.set('view engine', 'pug');

const itemRouter  = require("./itemRouter");

let items = {};
app.locals.idCounter = 0;
fs.readFile('items.json', 'utf-8', (err, data) =>
{
    if (err)
    {
        throw err;
    }

    if(data.length > 0)
    {
        items = JSON.parse(data.toString());
        Object.keys(items).forEach(id =>
        {
            let item = items[id];
            if(item.id > app.locals.idCounter)
            {
                app.locals.idCounter = item.id;
            }
        });
        app.locals.idCounter++;
        console.log("Loaded items!");
    }
});

function passItems(req, res, next)
{
    res.locals.items = items;
    next();
}

//Render home page
function getHomePage(req, res, next)
{
    res.header('Content-Type', 'text/html');
    res.render("index");
}

app.get("/", getHomePage);

app.use("/items", [passItems, itemRouter]);
app.listen(3000);
console.log("Server running at localhost:3000");
console.log("Connect on browser to access CRUD control panel");
