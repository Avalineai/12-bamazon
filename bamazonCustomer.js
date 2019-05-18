var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table')

var connection = mysql.createConnection({
    host: "localhost",
    port: 8889,
    user: "root",
    password: "root",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    //tableContent();
    customerContent();
    start();
})

function tableContent() {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        console.log("\n\n")
        console.table(results)
    })
}

function customerContent() {
    connection.query("SELECT item_id, product_name, price FROM products", function (err, results) {
        if (err) throw err;
        //const transformed = results.reduce((acc, {index, ...x}) => { acc[index] = x; return acc}, {})
        //console.log(results)
        console.log("\n\n")
        var table = new Table();
        // table.push(
        //     { 'Left Header 1': ['Value Row 1 Col 1', 'Value Row 1 Col 2'] }
        //     , { 'Left Header 2': ['Value Row 2 Col 1', 'Value Row 2 Col 2'] }
        // );
        var table = new Table({
            head: ['Id', 'Product Name', 'Price']
        , colWidths: [4, 40, 10]
        });
        results.forEach(function (item) {
            //console.log(item.item_id)
            //console.log(item.product_name)
            // console.log("$", item.price)
            //var itemId = item.item_id
            //console.log("#", item.item_id + " " + item.product_name + " " + "$", item.price)
            table.push([item.item_id, item.product_name, "$"+item.price]); 
            //console.log(item.RowDataPacket.item_id)
        })
        console.log(table.toString());
        //console.log("\n\n")
        //console.table(results)
        //console.table(transformed)
        //console.log(results)
        //console.log(results.RowDataPacket)
    })
}
function start() {
    //tableContent();
    inquirer
        .prompt({
            name: "buyOrQuit",
            type: "list",
            message: "Would you like to [BUY] an item or [QUIT]?",
            choices: ["BUY", "QUIT"]
        })
        .then(function (answer) {
            if (answer.buyOrQuit === "BUY") {
                showItems();
            } else {
                connection.end();
            }
        });
}
function showItems() {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        //console.table(results)
        inquirer
            .prompt([
                {
                    name: "choice",
                    type: "rawlist",
                    choices: function () {
                        var choiceArray = [];
                        for (var i = 0; i < results.length; i++) {
                            choiceArray.push(results[i].product_name);
                        }
                        return choiceArray;
                    },
                    message: "What item would you like to buy?"
                },
                {
                    name: "buy",
                    type: "input",
                    message: "How many would you like to buy?"
                }
            ])
            .then(function (answer) {
                // get the information of the chosen item
                var chosenItem;
                for (var i = 0; i < results.length; i++) {
                    if (results[i].product_name === answer.choice) {
                        chosenItem = results[i];
                    }
                }
                var originalQty = chosenItem.stock_quantity
                var itemPrice = chosenItem.price
                var newQty
                var purchaseTotal
                var purchaseTotalFinal
                if (answer.buy > chosenItem.stock_quantity) {
                    console.log("Insufficient quantity!...Please Try Again!");
                    start();
                }
                else if (chosenItem.stock_quantity > 0) {
                    // console.log("Available qty", originalQty)
                    // console.log("User Purchase qty", answer.buy)
                    newQty = originalQty - answer.buy
                    purchaseTotal = answer.buy * itemPrice
                    purchaseTotalFinal = purchaseTotal.toFixed(2)

                    // console.log("Item qty Left " + newQty)
                    connection.query(
                        "UPDATE products SET ? WHERE ?",
                        [
                            {
                                stock_quantity: newQty
                            },
                            {
                                item_id: chosenItem.item_id
                            }
                        ],
                        function (error) {
                            if (error) throw err;
                            console.log("\nPurchase total $" + purchaseTotalFinal + "\n")
                            console.log("Item purchased successfully!\n\n");
                            //tableContent();
                            customerContent();
                            start();
                        }
                    );

                }
                else {
                    console.log("Insufficient quantity!...Please Choose Again");
                    start();
                }
            });
    });
}