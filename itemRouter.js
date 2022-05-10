const express = require('express');
let router = express.Router();
router.use(express.static("public"));
const fs = require('fs');

function save(items)
{
    fs.writeFile('items.json', JSON.stringify(items), (err) =>
    {
        if (err)
        {
            throw err;
        }
    });
}

function getItems(req, res, next)
{
    res.format(
        {
            json: function()
            {
                res.status(200).json(res.locals.items);
                console.log("Sent " + res.locals.items.size + " items");
            }
        });

    next();
}

function addItem(req, res, next)
{
    console.log("Received add request...");
    if(req.body.name.length > 0)
    {
        let name = req.body.name;

        let newID = req.app.locals.idCounter++;

        let item = {name: name, id: newID, deleted: false};

        res.locals.items[item.id] = item;
        console.log("Added item: " + item.name + " ID: " + item.id);
        save(res.locals.items);
        res.status(200).json(item);
    }
    else
    {
        console.log("Add failed! Missing fields.");
        res.status(400).end();
    }
}

function setItem(req, res, next)
{
    let id = req.params.itemID;
    if(typeof res.locals.items[id] !== 'undefined')
    {
        console.log("Item changed." + req.body.name);

        res.locals.items[id] = req.body;
        save(res.locals.items);
        res.status(200).end();
    }
    else
    {
        console.log("Item change failed, not found.");
        res.status(404).end();
    }
}
function deleteItem(req, res, next)
{
    let id = req.params.itemID;
    if(typeof res.locals.items[id] !== 'undefined')
    {
        console.log("Item deleted.");
        res.locals.items[id].deleted = true;
        res.locals.items[id].comments = req.body.comments;
        save(res.locals.items);
        res.status(200).end();
    }
    else
    {
        console.log("Item deletion failed, not found.");
        res.status(404).end();
    }
}

router.get("/", getItems)
router.post("/", [express.json(), addItem]);
router.put("/:itemID", [express.json(), setItem]);
router.delete("/:itemID", [express.json(), deleteItem]);

module.exports = router;
