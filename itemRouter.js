const express = require('express');
let router = express.Router();
router.use(express.static("public"));
const fs = require('fs');

//Save inventory to file
function save(items)
{
    //Uncomment to reenable saving
    fs.writeFile('items.json', JSON.stringify(items), (err) =>
    {
        if (err)
        {
            throw err;
        }
    });
}

//Get a full map of inventory in JSON
function getItems(req, res, next)
{
    res.format(
        {
            json: function()
            {
                res.status(200).json(res.locals.items);
                console.log("Sent items");
            }
        });

    next();
}

//Add item to inventory
function addItem(req, res, next)
{
    if(req.body.name.length > 0)
    {
        let name = req.body.name;

        let newID = req.app.locals.idCounter++;

        let item = {name: name, id: newID, deleted: false};

        res.locals.items[item.id] = item;
        console.log("Added item \'" + item.name + "\'");
        save(res.locals.items);
        res.status(200).json(item);
    }
    else
    {
        console.log("Add failed! Missing fields.");
        res.status(400).end();
    }
}

//Update item from inventory
function setItem(req, res, next)
{
    let id = req.params.itemID;
    if(typeof res.locals.items[id] !== 'undefined')
    {
        console.log("Updated item \'" + req.body.name + "\'");

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

//Delete item from inventory (but keep in memory for undelete)
function deleteItem(req, res, next)
{
    let id = req.params.itemID;
    if(typeof res.locals.items[id] !== 'undefined')
    {
        if(res.locals.items[id].deleted)
        {
            console.log("Permanently deleted item \'" + res.locals.items[id].name + "\'");
            delete res.locals.items[id];
        }
        else
        {
            console.log("Deleted item \'" + res.locals.items[id].name + "\'");
            res.locals.items[id].deleted = true;
            res.locals.items[id].comments = req.body.comments;
        }

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
