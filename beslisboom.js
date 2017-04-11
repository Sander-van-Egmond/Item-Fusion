var txtFile = "Beslisboom.txt";

var nodes = [];
var edges = [];

var readline = require('readline');
var rl = readline.createInterface(process.stdin, process.stdout);

function Node(naam, vraag){
    this.naam = naam;
    this.vraag = vraag;
    this.options = [];
}

function Edge(oorsprong, doel, antwoord){
    this.oorsprong = oorsprong; //Node
    this.doel = doel; //Node
    this.antwoord = antwoord;
}

function readData(){
    var fs = require("fs");
    var data = fs.readFileSync(txtFile).toString();
    var lines = data.split("\r\n");
    for (var i=0 ; i<lines.length ; i++ ){
        readLine(lines[i]);
    }
    updateNodes();
    updateEdges();
}

function readLine(line){
    if (line.split(",").length===2){
        createNode(line);
    }else{
        createEdge(line);
    }
}

function createNode(line){
    var splitLine = line.split(", ");
    var node = new Node(splitLine[0],splitLine[1]);
    nodes.push(node);
}

function createEdge(line){
    var splitLine = line.split(", ");
    var edge = new Edge(splitLine[0],splitLine[1],splitLine[2]);
    edges.push(edge);
}

function updateNodes(){ // Nodes verwijzen nu naar de objecten van edges ipv naar strings
    for (var i = 0 ; i<nodes.length ; i++) {
        for (var j = 0; j < edges.length; j++){
            if (edges[j].oorsprong === nodes[i].naam) {
                nodes[i].options.push(edges[j]);
            }
        }
    }
}

function updateEdges(){ // Edges verwijzen nu naar de objecten van Nodes ipv naar strings
    for (var i = 0 ; i<edges.length ; i++) {
        for (var j = 0; j < nodes.length; j++){
            if (edges[i].oorsprong === nodes[j].naam) {
                edges[i].oorsprong = nodes[j];
            }
            if (edges[i].doel === nodes[j].naam){
                edges[i].doel = nodes[j];
            }
        }
    }
}

function start(){ //ongeacht op welke volgorde je de gegevens hebt staan, de startnode wordt gevonden
    var doelNodes = [];
    for (var i = 0 ; i<edges.length ; i++){
        doelNodes.push(edges[i].doel)
    }
    for (var j = 0 ; j<nodes.length ; j++){
        if (!check(nodes[j],doelNodes)){
            output(nodes[j]);
        }
    }
}

function output(node){
    console.log(node.vraag);
    if (node.options.length === 0){
        process.exit()
    }else{
        for (var i = 0 ; i<node.options.length ; i++){
            console.log(i+1+". "+node.options[i].antwoord);
        }
        input(node)
    }
}

function input(node){
    rl.question("> ", antwoord(node));
}

function antwoord(node){
    return function(answer){
        if (answer > 0 && answer <= node.options.length) {
            output(node.options[answer - 1].doel);
        }else{
            console.log("Kies een van de opties.");
            input(node);
        }
    }
}

function check(number,lines){
    return lines.indexOf(number) > -1 ;
}

readData();
start();