var txtFile = "ItemFusions.txt";

var fusions = [];
var items = [];
var currentshop = 0;

var readline = require('readline');
var rl = readline.createInterface(process.stdin, process.stdout);

function Fusion(name){
    this.name = name;
    this.itemsReq = [];
}

function Item(name, price, shop,cheapest){
    this.name = name;
    this.price = price;
    this.shop = shop;
    this.fusionOptions = [];
    this.cheapestReqs = [];
    this.cheapestPrice = cheapest;
}
function readData(){
    var fs = require("fs");
    var data = fs.readFileSync(txtFile).toString();
    var lines = data.split("\r\n");
    for (var i=0 ; i<lines.length ; i++ ){
        readLine(lines[i]);
    }
    updateFusions();
    updateItems();
}

function readLine(line){
    var fusionPattern = new RegExp(" \\+ ");
    var itemPattern = new RegExp(" \\~ [0-9]");
    var storePattern = new RegExp("Store Items:");
    if (fusionPattern.test(line)){
        readFusion(line);
    }else if(itemPattern.test(line)){
        readItem(line);
    }else if(storePattern.test(line)){
        currentshop++;
    }
}

function readFusion(line){
    var fusion,name,items;
    items = line.split(" = ")[0];
    name = line.split(" = ")[1];
    fusion = new Fusion(name);
    fusion.itemsReq = items.split(" + ");
    fusions.push(fusion);
}

function readItem(line){
    if (currentshop === 1 || line.charAt(0)==="*"){
        var name,price,shop;
        shop = currentshop;
        name = line.split(" ~ ")[0];
        if (name.charAt(0) === "*"){
            name = name.substr(1);
        }
        price = parseInt(line.split(" ~ ")[1]);
        items.push(new Item(name,price,shop,price));
    }
}

function updateFusions(){
    for (var i in fusions) {
        updateFusionContent(fusions[i]);
    }
}

function updateFusionContent(fusion){
    updateFusionItems(fusion);
    updateName(fusion);
}

function updateFusionItems(fusion){
   for (var i in items){
       for (var j in fusion.itemsReq) {
           if (fusion.itemsReq[j] === items[i].name) {
               fusion.itemsReq[j] = items[i];
           }
       }
   }
}

function updateName(fusion){
    for (var i in items){
        if (items[i].name === fusion.name){
            fusion.name = items[i];
            return;
        }
    }
    var epicItem = new Item(fusion.name,100000,6);// 100000 so it is never the cheapest, shop 6 so it is never the earliest
    fusion.name = epicItem;
    items.push(epicItem);
}

function updateItems(){
    for (var i in items) {
        addFusions(items[i]);
    }
}

function addFusions(item){
    for (var i in fusions){
        if (fusions[i].name === item){
            item.fusionOptions.push(fusions[i]);
        }
    }
}

function startCheapest(itemString){
    var item = searchItem(itemString);
    var result = cheapestItem(item,[]);
    console.log("\n\nprice: " + result[0]);
    printHistory(result[1]);
}

function printHistory(list){
    console.log("\nPath:");
    for (var i in list){
        var unit = list[i];
        if (unit instanceof Item){
            console.log("Item: "+unit.name);
        }else if(unit instanceof Fusion){
            console.log("Fusion: "+ unit.name.name);
        }else{
            console.log("ERROR");
        }

    }
}

function cheapestItem(item,history){
    var price = item.price;
    var path = concatToNewArray(history);
    path.push(item);
    var newPath = concatToNewArray(path);
    for (var i in item.fusionOptions){
        var fusion = item.fusionOptions[i];
        if (pathTaken(fusion,path)){continue;} // voorkomt oneindige loop
        var order = cheapestFusion(fusion,path);
        if (order[0]<price){
            price = order[0];
            newPath = order[1];
        }
    }
    return [price, newPath];
}

function concatToNewArray(add){
    var newArray = [];
    newArray = newArray.concat(add);
    return newArray;
}

function cheapestFusion(fusion, history){
    var path = concatToNewArray(history);
    path.push(fusion);
    var price = 0;
    var newPath = concatToNewArray(path);
    for (var i in fusion.itemsReq){
        var item = fusion.itemsReq[i];
        var result = cheapestItem(item,path);
        price += result[0];
        newPath = newPath.concat(result[1].slice(path.length));

    }
    return [price, newPath];
}

function pathTaken(unit,history){
    return (history.indexOf(unit) > -1 || history.length > 6);
}

function searchItem(name){
    for (var i in items){
        var item = items[i];
        if (item.name === name){
            return item;
        }
    }
}

readData();
startCheapest("Glitter Arrow");