//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash")
const mongoose=require("mongoose")
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-shahil:test123@cluster0.ooamulr.mongodb.net/todolistDB")

const itemsSchema=new mongoose.Schema({
  name:String
});
 
const Item=mongoose.model("Item",itemsSchema)
  
const item1=new Item({
  name:"Welcome to your todolist!"
})

const item2=new Item({
  name:"Hit the + button to add a new item."
})

const item3=new Item({
  name:"<-- Hit this tot delete an item"
})
 
const defaultItems=[item1,item2,item3];

const listSchema=new mongoose.Schema({
  name:String,
  items:[itemsSchema]
})
 const List=mongoose.model("List",listSchema)

// 
//  this method find is used to show all the things that stored in the
// that stored in the dbs in the console.log
// and then that thing we will store in a const then it will show in a 
// show in the browser using item
   
app.get("/", function(req, res) {
     
  Item.find({},function(err,foundItems){
      
   if(foundItems.length===0){
    Item.insertMany(defaultItems,function(err){
      if(err){
        console.log(err);
      }else{
        console.log("successfully saved default items to DB")
      }
    })
    res.redirect("/")
   }else{
    res.render("list",{listTitle:"Today",newListItems:foundItems});
   }

});
});
// we created a default items will work when there is nothing inside 
// if there is something inside it will shows us 

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  
  const item=new Item({
     name:itemName
   });
      if(listName==="Today"){
        item.save();
        res.redirect("/")
      }else{
     List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName)
     });
      }

});


app.post("/delete",function(req,res){

 const checkedItemId =req.body.checkbox;
 const listName=req.body.listName;
  
       if(listName==="Today"){
        Item.findByIdAndRemove(checkedItemId, function(err){
          if(!err){
            console.log("Sucessfully Deleted the item from DB");
          }
         });
        }else{
           List.findOneAndUpdate({name:listName},
            {$pull:{items:{_id:checkedItemId}}},
            function(err,foundList){
              if(!err){
                res.redirect("/"+listName)
              }
            })
        }
        });
       

    
app.get("/:customListName",function(req,res){
         const customListName= _.capitalize(req.params.customListName)

         List.findOne({name:customListName},function(err,foundList){
          if(!err){
            if(!foundList){
              //create a new list
              const list=new List({
                name:customListName,
                items:defaultItems
      
               })
               list.save();
               res.redirect("/"+customListName)
            }else{
            // show an existing list
            res.render("list",{listTitle:foundList.name
              ,newListItems:foundList.items});
           
            }
          }
         })
         
        
      
})

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started Successfully");
});
