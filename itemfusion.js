var txtFile = "ItemFusions.txt";

var fusions = [];
var items = [];
var currentshop = 0;

var readline = require('readline');
var rl = readline.createInterface(process.stdin, process.stdout);

//DEFINE CLASSES

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

// READ DATA


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

// UPDATE DATA AND SET REFERENCES

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

// ASK INPUT

function input(){
    rl.question("Geef naam item:\n> ", antwoord);
}

function antwoord(answer){
    if (searchItem(answer) === null){
        console.log("Item niet gevonden.");
        input();
    }else {
        rl.question("Goedkoopste of snelste? [g/s]\n> ", start(answer));
    }
}

// COMPUTE ANSWER

function start(answer1){
    return function(answer2) {
        if (answer2 !== "g" && answer2 !== "s") {
            antwoord(answer1);
        } else {

            var item = searchItem(answer1);

            var result;
            if (answer2 === "g") {
                result = cheapestItem(item, []);
            } else if (answer2 === "s") {
                result = fastestItem(item, []);
            }
            printInterface(result, answer2);
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


function fastestItem(item,history){
    var price = item.price;
    var path = concatToNewArray(history);
    var shop = item.shop;
    path.push(item);
    var newPath = concatToNewArray(path);
    for (var i in item.fusionOptions){
        var fusion = item.fusionOptions[i];
        if (pathTaken(fusion,path)){continue;} // voorkomt oneindige loop
        var order = fastestFusion(fusion,path);
        if (order[2]<shop){
            price = order[0];
            newPath = order[1];
            shop = order[2];
        }else if(order[2] === shop && order[0]<price){
            price = order[0];
            newPath = order[1];
            shop = order[2];
        }
    }
    return [price, newPath];
}

function fastestFusion(fusion, history){
    var path = concatToNewArray(history);
    path.push(fusion);
    var price = 0;
    var shop = 0;
    var newPath = concatToNewArray(path);
    for (var i in fusion.itemsReq){
        var item = fusion.itemsReq[i];
        var result = fastestItem(item,path);
        price += result[0];
        if (item.shop>shop){shop = item.shop}
        newPath = newPath.concat(result[1].slice(path.length));
    }
    return [price, newPath, shop];
}

function concatToNewArray(add){
    var newArray = [];
    newArray = newArray.concat(add);
    return newArray;
}

function pathTaken(unit,history){
    return (history.indexOf(unit) > -1 || history.length > 7);
}

function searchItem(name){
    for (var i in items){
        var item = items[i];
        if (item.name === name){
            return item;
        }
    }
    return null;
}

/// Print Interface:

function printInterface(result,relevancy){
    if (relevancy === "g"){
        console.log("\nGoedkoopste recept:\n==================")
    }else if(relevancy === "s"){
        console.log("\nSnelste recept:\n==================")
    }
    var charLength = maxLength(result[1]);
    printTree(result[1],charLength);
    printReceipt(result);
}


function printTree(list,longestName) {
    printBranch(list, 0, 0,longestName);
}

function printBranch(list, room,branchNumber,longestName){
    var string = printSpaces(room, longestName)+repeat("  |  "+repeat(" ",longestName),branchNumber);
    if (room>0){string+="  +--"}
    string += itemNameFormat(list[0].name,longestName);
    var restList = concatToNewArray(list).slice(1);
    if(branchNumber === 0 ){room+=1}
    for (var i = 1 ; i<list.length ; i++){
        if (list[i] instanceof Item){
            break;
        }else{
            string += "<-+--"+itemNameFormat(list[i+1].name,longestName);
            i++;
            branchNumber+=1;
            restList = restList.slice(2);
        }
    }
    console.log(string);
    if (restList.length>0){
        printRoom(restList,room,branchNumber,longestName);
    }
}

function itemNameFormat(itemName, length){
    var toAdd = length-itemName.length;

    var string = "";
    string += repeat(" ",Math.floor(toAdd/2));
    string += itemName;
    string += repeat(" ",toAdd - Math.floor(toAdd/2));
    return string;
}

function printSpaces(room,longestName){
    var string = "";
    string += repeat(" ",longestName*room+((room-1)*5));
    return string;
}

function printRoom(list,room, branchNumber,longestName){
    var string ="";
    string += printSpaces(room,longestName);
    string += repeat("  |  "+repeat(" ",longestName),branchNumber);
    console.log(string);
    printBranch(list,room,branchNumber-1,longestName);
}

function printReceipt(list){
    var buyItems = getBasicItems(list[1]);
    var stringLength = maxLength(list[1]);
    console.log("\nAanschaf items:\n===============");
    for (var i = 0 ; i<buyItems.length ; i+=2){
        var extraSpaces = repeat(" ",stringLength-buyItems[i].name.length);
        console.log(buyItems[i+1]+"x "+buyItems[i].name+extraSpaces+" "+buyItems[i+1]+"x "+buyItems[i].price+" = "+buyItems[i].price*buyItems[i+1]);
    }
    console.log(repeat("-",stringLength)+"-----------------\nTotale kosten"+repeat(" ",stringLength)+list[0]);
}

function maxLength(list){
    var result = 0;
    for (var i in list){
        if (list[i].name.length>result){result = list[i].name.length}
    }
    return result;
}

function repeat(char,times){
    var string = "";
    for (var i = 0 ; i < times ; i++){
        string += char;
    }
    return string;
}


function getBasicItems(list){
    var basicList = [];
    for (var i = list.length-1 ; i >= 0 ; i--){
        if (list[i] instanceof Fusion){
            i--
        }else{
            var index = basicList.indexOf(list[i]);
            if (index>-1){
                basicList[index+1]+=1;
            }else {
                basicList.push(list[i]);
                basicList.push(1);
            }
        }
    }
    return basicList;
}


/// Run
readData();
input();