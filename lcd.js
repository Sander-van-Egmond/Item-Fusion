var size = 2;
var ampmMode = false;

process.argv.forEach(function (val, index, array) {
    if (check("-12",array) && check("-24",array)){
        console.log("Slechts 1 van de opties -12 en -24 kan worden meegegeven.");
        process.exit();
    }

    if (val === "-s"){
        if (0 < array[index+1] && array[index+1] < 6) {
            size = array[index + 1];
        }
    }
    if (val === "-12"){
        ampmMode = true;
    }
});

var hour1,hour2,minute1,minute2,ampm;

function getDate(){
    var now = new Date();
    var hours = now.getHours();
    var minutes = now.getMinutes();

    if (ampmMode) {
        if (hours / 12 >= 1) {
            ampm = "P";
            hours -= 12;
        } else {
            ampm = "A"
        }
    }

    hour1 = Math.floor(hours / 10);
    hour2 = hours % 10;
    minute1 = Math.floor(minutes/10);
    minute2 = minutes%10;
}

function printClock(){
    console.log("De huidige tijd is:\n");
    var topLine = [2,3,5,6,7,8,9,0,"A","P"];
    var middleLine = [2,3,4,5,6,8,9,"A","P"];
    var botLine = [2,3,5,6,8,9,0];

    var leftUpper = [4,5,6,8,9,0,"A","P"];
    var rightUpper = [1,2,3,4,7,8,9,0,"A","P"];
    var leftLower = [2,6,8,0,"A","P"];
    var rightLower = [1,3,4,5,6,7,8,9,0,"A"];

    printLine(topLine);
    printPart(leftUpper, rightUpper);
    printLine(middleLine);
    printPart(leftLower, rightLower);
    printLine(botLine);
}

function printLine(lines){
    var string = "";
    if (ampmMode){
        string += lineSegment(check(ampm,lines))+" ";
    }
    string += lineSegment(check(hour1, lines));
    string += lineSegment(check(hour2, lines));
    string += repeat(" ")+" ";
    string += lineSegment(check(minute1, lines));
    string += lineSegment(check(minute2, lines));
    console.log(string);
}

function check(number,lines){
    return lines.indexOf(number) > -1 ;
}

function lineSegment(streepje){
    var string = " ";
    var addition;
    if(streepje){
        addition = "-"
    }else{addition = " "}

    for (var i = 0 ; i < size ; i++){
        string += addition;
    }
    string += "  ";
    return string;
}

function barSegment(bar){
    if(bar){
        return "|"
    }else{
        return " "
    }
}

function repeat(char){
    var string = "";
    for (var i = 0 ; i < size ; i++){
        string += char;
    }
    return string;
}

function printPart(left,right){
    for (var i = 0 ; i < size ; i++) {
        var string = "";
        if (ampmMode){
            string += numberPart(ampm,left,right)+" ";
        }
        string += numberPart(hour1, left, right);
        string += numberPart(hour2, left, right);
        string += repeat("-")+" ";
        string += numberPart(minute1, left, right);
        string += numberPart(minute2, left, right);
        console.log(string);
    }
}

function numberPart(number, left, right){
    var string = "";
    string += barSegment(check(number,left));
    string += repeat(" ");
    string += barSegment(check(number,right));
    string += " ";
    return string;
}

getDate();
printClock();