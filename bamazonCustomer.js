var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",

    port: 8889,

    user: "root",

    password: "root",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    showItems();

})

function showItems() {
    connection.query("SELECT * FROM products",
        function (err, results) {
            if (err) throw err;
            console.table(results)

            inquirer
            .prompt([
                {
                    name: "idRequest",
                    type: "input",
                    message: "Choose the item id",
                    validate: function (value) {
                        if (isNaN(value) === false) {
                            return true;
                        }
                        return false;
                    }
                },
                {
                    name: "qtyRequest",
                    type: "input",
                    message: "Choose the item quantity to purchase",
                    validate: function (value) {
                        if (isNaN(value) === false) {
                            return true;
                        }
                        return false;
                    }
                },
                {
                    name: "exit",
                    type: "input",
                    message: "Type 'x' to Exit",
                }
            ])
            .then(function(answer){
                console.log("id", answer.idRequest)
                console.log("qty", answer.qtyRequest)

                connection.query(
                    //not updating table properly...
                    "UPDATE products SET ? WHERE ?",
                    [
                        {
                            item_id: answer.idRequest
                        },
                        {
                            stock_quantity: answer.qtyRequest
                        }
                    ],
                    function(error, updatedTable) {
                        if (error) throw err;
                        console.table(updatedTable)
                    })
                console.log("x?", answer.exit)
                if (answer.exit === 'x'){
                    connection.end()
                }
            })
            
        })
}