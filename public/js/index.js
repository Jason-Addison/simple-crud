let items = {};

function addItem()
{
    //Verify an item name was entered
    let itemName = document.getElementById("itemname").value;
    if(itemName.length == 0)
    {
        alert("You must enter an item name.");
        return;
    }

    //Add a new object to the items array and render
    let item = {name: itemName, deleted: false}

    let req = new XMLHttpRequest();
    req.onreadystatechange = function()
    {
        if(this.readyState == 4)
        {
            if(this.status == 200)
            {
                let newItem = JSON.parse(this.responseText);
                document.getElementById("itemname").value = "";
                items[newItem.id] = newItem;
                renderList();
                console.log("Added item: " + newItem.name + " " + newItem.id);
            }
            else if(this.status == 400)
            {
                console.log("Bad Request! Failed to add item!");
                alert("Failed to add item, invalid/missing fields!");
            }
        }
    }

    req.open("POST", `/items`);
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(item));
}

function editItem(index)
{
    renderList();
    let item = document.getElementById('edit' + index);
    item.disabled = true;
    item.parentNode.lastElementChild.disabled = false;

    let saveButton = document.createElement("input");
    saveButton.type = "button";
    saveButton.value = "Save";
    saveButton.addEventListener('click', function()
    {
        let newItem = items[index];
        newItem.name = document.getElementById('text' + index).value;
        let req = new XMLHttpRequest();
        req.onreadystatechange = function()
        {
            if(this.readyState == 4)
            {
                if(this.status == 200)
                {
                    items[index].name = newItem.name;
                    console.log("Item saved!");
                    renderList();
                }
                else
                {
                    alert('Save failed!');
                }
            }
        }
        req.open("PUT", `/items/` + items[index].id);
        req.setRequestHeader("Content-Type", "application/json");
        req.send(JSON.stringify(newItem));
    });
    item.parentNode.appendChild(saveButton);


}

function deleteItem(index)
{
    let alreadyDeleted = items[index].deleted;
    let comments;
    if (alreadyDeleted || (comments = prompt("Press OK to delete.\nAdd comments:", "")) != null)
    {
        items[index].comments = comments;
        let req = new XMLHttpRequest();

        req.onreadystatechange = function()
        {
            if(this.readyState == 4)
            {
                if(this.status == 200)
                {
                    if(alreadyDeleted)
                    {
                        delete items[index];
                    }
                    else
                    {
                        items[index].deleted = true;
                        console.log("Item deleted!");
                    }

                    renderList();
                }
                else
                {
                    alert('Save failed!');
                }
            }
        }
        req.open("DELETE", `/items/` + items[index].id);
        req.setRequestHeader("Content-Type", "application/json");
        req.send(JSON.stringify(items[index]));
    }
}

function restoreItem(index)
{
    let item = items[index];
    item.deleted = false;
    renderList();
    let req = new XMLHttpRequest();
    req.onreadystatechange = function()
    {
        if(this.readyState == 4)
        {
            if(this.status == 200)
            {
                console.log("Item restored!");
                items[index].deleted = false;
                renderList();
            }
            else
            {
                alert('Restore failed!');
            }
        }
    }
    req.open("PUT", `/items/` + items[index].id);
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(item));
}

function renderList()
{
    let newList = document.createElement("div");
    newList.id = "list";

    let newDeletedList = document.createElement("div");
    newDeletedList.id = "deletedList";

    Object.keys(items).forEach(id =>
    {
        let elem = items[id];
        if(!elem.deleted)
        {
            let newDiv = document.createElement("div");
            let id = elem.id;

            let newDelete = document.createElement("input");
            newDelete.type = "button";
            newDelete.value = "Delete";
            newDelete.addEventListener('click', function()
            {
                deleteItem(id);
            });
            newDiv.appendChild(newDelete);

            let newEdit = document.createElement("input");
            newEdit.type = "button";
            newEdit.value = "Edit";
            newEdit.id = 'edit' + id;
            newEdit.addEventListener('click', function()
            {
                editItem(id);
            });
            newDiv.appendChild(newEdit);

            let text = document.createElement("input");
            text.disabled = true;
            text.value = elem.name;
            text.id = "text" + id;
            newDiv.appendChild(text);

            newList.prepend(newDiv);
        }
        else
        {
            let newDiv = document.createElement("div");
            let id = elem.id;

            let newDelete = document.createElement("input");
            newDelete.type = "button";
            newDelete.value = "Permanently Delete";
            newDelete.addEventListener('click', function()
            {
                deleteItem(id);
            });
            newDiv.appendChild(newDelete);

            let newRestore = document.createElement("input");
            newRestore.type = "button";
            newRestore.value = "Restore";
            newRestore.addEventListener('click', function()
            {
                restoreItem(id);
            });
            newDiv.appendChild(newRestore);

            let text = document.createElement("input");
            text.disabled = true;
            text.value = elem.name;
            text.id = "text" + id;
            newDiv.appendChild(text);

            if(typeof elem.comments !== 'undefined' && elem.comments.length > 0)
            {
                let comments = document.createTextNode("Comments: " + elem.comments);
                newDiv.appendChild(comments);
            }

            newDeletedList.prepend(newDiv);
        }
    });
    let origList = document.getElementById("list");
    origList.parentNode.replaceChild(newList, origList);

    let origDeletedList = document.getElementById("deletedList");
    origDeletedList.parentNode.replaceChild(newDeletedList, origDeletedList);
}

function start()
{
    document.getElementById("additem").addEventListener("click", addItem);

    let req = new XMLHttpRequest();
    req.onreadystatechange = function()
    {
        if(this.readyState == 4)
        {
            if(this.status == 200)
            {
                items = JSON.parse(this.responseText);

                renderList();
            }
            else if(this.status == 400)
            {
                console.log("Failed to fetch items  JSON");
                alert("Failed to fetch items JSON");
            }
        }
    }

    req.open("GET", `/items`);
    req.setRequestHeader("Content-Type", "application/json");
    req.send();
}
