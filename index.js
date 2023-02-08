
//jshint esversion:6
require("dotenv").config()
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const PORT = process.env.PORT || 3000
const _ = require("lodash");
const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.set('strictQuery', false);
//mongoose.connect("mongodb://127.0.0.1:27017/todolistDB")
const connectDB = async () => {
  try{
    const conn = await mongoose.connect(process.env.MONGO_URI)
    console.log(conn)
    console.log(`Mongo DB Connected: ${conn.connection.host}`)
    
  } catch(error) {
    console.log(error)
    process.exit(1)
  }}

const itemsSchema = {
  name: String
}
const Item = mongoose.model("Item", itemsSchema)

const item2 = new Item({
  name : "Welcome to your todolist"
})

const item3 = new Item({
  name : "Hit the + button to add a new item"
})

const item4= new Item({
  name : "Hit this to delete an item"
})
const defaultItems = [item2, item3, item4]
const listSchema = {
   name: String,
  items : [itemsSchema]
  }
const List = mongoose.model("List",  listSchema)
app.get("/", function(req, res) {
Item.find({}, function(err, foundItems){
  if(foundItems.length === 0){
    Item.insertMany(defaultItems, function(err){
  if(err){
    console.log(err)
  }
  else{
    console.log("Success")
  }
}) ;
res.redirect("/");
  }
  else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }

})

});

app.get("/:customListName", function(req, res){
  const customListName =  _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if (!err){
      if (!foundList){
      
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        //Show an existing list

        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });



});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res){
  const checkedId = req.body.checkbox
  const listName = req.body.listName
 if(listName === "today") {
  Item.findByIdAndRemove(checkedId, function(err){
     if(!err){
      console.log("deleted")
      res.redirect("/")
     }
  }) }
  else{
    List.findOneAndUpdate({name: listName}, {$pull:{items: {_id: checkedId}}}, function(err){
 if(!err){
  res.redirect("/" + listName)
 }
    })
  }
})

connectDB().then(() => {
 
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
  })
})
//app.listen(3000, function(){
  //console.log("Server started on port 3000.");
//});
  