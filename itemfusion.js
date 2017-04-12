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

function cheapest(item){
    cheapestOptions(item,item.cheapestPrice,[item],[]);
}

function cheapestOptions(item,oldPrice,oldReqs,oldHistory){
    var cheapest = oldPrice;
    var requirements = oldReqs;
    var history = oldHistory;
    if (checkHistory(item,history)){return}
    for (var i in item.fusionOptions){
        history.push(item);
        cheapestReqs(item.fusionOptions[i],history);
        history.splice(history.length-1,1);
        var update = updateCheapest(cheapest, requirements, item.fusionOptions[i]);
        cheapest = update[0];
        requirements = update[1];
    }
    item.cheapestPrice = cheapest;
    item.cheapestReqs = requirements;
}

function cheapestReqs(fusion,history){
    for (var i in fusion.itemsReq){
        console.log(history.length);
        cheapestOptions(fusion.itemsReq[i],fusion.itemsReq[i].cheapestPrice,[fusion.itemsReq[i]],history);
    }
}

function checkHistory(item,history){
    return (history.indexOf(item) > -1 || history.length > 2);
}

function updateCheapest(oldCheapest,requirements,fusion){
    var newCheapest = compareCost(oldCheapest, fusion);
     if (newCheapest < oldCheapest){
        requirements = fusion.itemsReq;
    }
    return [newCheapest,requirements];
}

function compareCost(oldPrice, fusion) {
    var newPrice = 0;
    for (var i in fusion.itemsReq) {
        newPrice += fusion.itemsReq[i].price;
    }
    if (newPrice < oldPrice) {
        return newPrice;
    }
    return oldPrice;
}


readData();
cheapest(items[0]);


