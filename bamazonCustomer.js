var mysql = require("mysql")
var inquirer = require("inquirer")
var table = require("cli-table")

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "password123",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);

  showProducts();
});

function showProducts(){
    var query = "SELECT item_id, product_name, department_name, price, stock_quantity FROM products"
    connection.query(query, function(err,res){
        var display = new table({
            head: ["item_id", "product_name", "department_name", "price", "quantity"],
            colWidths: [10, 30, 30, 10, 15]
        })
        for (var i=0; i<res.length; i++){
            display.push([res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity])
        }
        console.log(display.toString())
        selectProducts()
    });
}

function selectProducts(){
    inquirer.prompt([
        {
            name:"product",
            type:"input",
            message: "What is the product ID?"
        },
        {
            name:"total",
            type:"number",
            message:"How many units would you like to purchase?"
        }
    ]).then(function(answer){
        var query = "SELECT item_id, product_name, department_name, price, stock_quantity FROM products WHERE ?"
        connection.query(query,{
            item_id: answer.product
        }, function(err, res){
            if (res[0].stock_quantity === undefined){
                console.log("Item does not exist")
            } else if (answer.total>res[0].stock_quantity){
                console.log("Insufficent quantity! There are only " + res[0].stock_quantity + " left")     
            } else{
                console.log("totalCost = " + res[0].price * answer.total)
                var remaining = res[0].stock_quantity - answer.total
                connection.query("UPDATE products SET ? WHERE ?", [
                    {
                        stock_quantity: remaining      
                    },
                    {
                        item_id: answer.product  
                    }
                ],function(err){
                  if(err) throw err  
                })  
                
                console.log("Inventory Updated")
            }      
            
            showProducts()
        })
    })    
}