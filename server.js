const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

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

app.use(express.static("public"));
app.set('view engine', 'pug');

const itemRouter  = require("./itemRouter");

//Add restaurant page
function addRestaurant(req, res, next)
{
    res.header('Content-Type', 'text/html');
    res.render("pages/addrestaurant");
}

//Load all restaurants from file
function loadAllRestaurants()
{
    console.log("Loading restaurants...");
    //Load all restaurant files in the directory
    const jsonsInDir = fs.readdirSync('./restaurants').filter(file => path.extname(file) === '.json');;

    //Parse and add every file
    jsonsInDir.forEach(file =>
    {
        const fileData = fs.readFileSync(path.join('./restaurants', file));
        const restaurant = JSON.parse(fileData.toString());
        restaurants[restaurant.id] = restaurant;
    });
    console.log("Loaded " + jsonsInDir.length + " restaurants.");
}


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
app.get("/addrestaurant", addRestaurant);
app.put("/items/:item"), function(req, res, next)
{
    let item = req.item;
}

app.post("/")
app.use("/items", [passItems, itemRouter]);
app.listen(3000);
console.log("Server running at localhost:3000");
