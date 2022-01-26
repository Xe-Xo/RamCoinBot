
function freshCards(){

    var fresh = []
    var suits = ["Spades", "Clubs", "Diamonds", "Hearts"];
    var cards = ["Ace","2","3","4","5","6","7","8","9","10","Jack","Queen","King"];
    for (let si = 0; si < suits.length; si++) {
        const suit = suits[si];
        for (let ci = 0; ci < cards.length; ci++) {
            const card = cards[ci];
            let suitcard = {suit: suit, card: card, text: card + ' of ' + suit, value: cardValues(card)};
            fresh.push(suitcard)
        }
    }

    return fresh;

};

function shuffle(array) {

    // FISHER YATES SHUFFLE

    let currentIndex = array.length,  randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
};

function shuffleCards(){
    return shuffle(freshCards());
};

function cardValues(card){
    let possible_values = [];

    switch(card){
        case 'Ace':
            possible_values = [1, 11];
            break;
        case 'Jack':
            possible_values = [10];
            break;
        case 'Queen':
            possible_values = [10];
            break;
        case 'King':
            possible_values = [10];
            break;
        default:
            try {
                possible_values = [parseInt(card)];
                break;
            } catch {
                possible_values = []
                break;
            }
    }
    
    return possible_values;

};

function totalValues(cardarray){

    let array_of_arrays = [];
    for (let index = 0; index < cardarray.length; index++) {
        const element = cardarray[index];
        array_of_arrays.push(element.value);
    }
    
    let blackjackvalueArray = combineArrays(array_of_arrays).filter((n) => n === 21);
    let under21valueArray = combineArrays(array_of_arrays).filter((n) => n < 21);
    let over21valueArray = combineArrays(array_of_arrays).filter((n) => n > 21);

    if (blackjackvalueArray.length >= 1) {
        return blackjackvalueArray[0];
    }

    if (under21valueArray.length < 1){
        return over21valueArray[0];
    }

    return under21valueArray.sort()[0];

}

function combineArrays( array_of_arrays ){

    // First, handle some degenerate cases...

    if( ! array_of_arrays ){
        // Or maybe we should toss an exception...?
        return [];
    }

    if( ! Array.isArray( array_of_arrays ) ){
        // Or maybe we should toss an exception...?
        return [];
    }

    if( array_of_arrays.length == 0 ){
        return [];
    }

    for( let i = 0 ; i < array_of_arrays.length; i++ ){
        if( ! Array.isArray(array_of_arrays[i]) || array_of_arrays[i].length == 0 ){
            // If any of the arrays in array_of_arrays are not arrays or zero-length, return an empty array...
            return [];
        }
    }

    // Done with degenerate cases...

    // Start "odometer" with a 0 for each array in array_of_arrays.
    let odometer = new Array( array_of_arrays.length );
    odometer.fill( 0 ); 

    let output = [];

    let newCombination = formCombination( odometer, array_of_arrays );

    output.push( newCombination );

    while ( odometer_increment( odometer, array_of_arrays ) ){
        newCombination = formCombination( odometer, array_of_arrays );
        output.push( newCombination );
    }

    return output;
}/* combineArrays() */


// Translate "odometer" to combinations from array_of_arrays
function formCombination( odometer, array_of_arrays ){
    // In Imperative Programmingese (i.e., English):
    // let s_output = "";
    // for( let i=0; i < odometer.length; i++ ){
    //    s_output += "" + array_of_arrays[i][odometer[i]]; 
    // }
    // return s_output;

    // In Functional Programmingese (Henny Youngman one-liner):
    return odometer.reduce(
      function(accumulator, odometer_value, odometer_index){
        return 0 + accumulator + array_of_arrays[odometer_index][odometer_value];
      },
      0
    );
}/* formCombination() */

function odometer_increment( odometer, array_of_arrays ){

    // Basically, work you way from the rightmost digit of the "odometer"...
    // if you're able to increment without cycling that digit back to zero,
    // you're all done, otherwise, cycle that digit to zero and go one digit to the
    // left, and begin again until you're able to increment a digit
    // without cycling it...simple, huh...?

    for( let i_odometer_digit = odometer.length-1; i_odometer_digit >=0; i_odometer_digit-- ){ 

        let maxee = array_of_arrays[i_odometer_digit].length - 1;         

        if( odometer[i_odometer_digit] + 1 <= maxee ){
            // increment, and you're done...
            odometer[i_odometer_digit]++;
            return true;
        }
        else{
            if( i_odometer_digit - 1 < 0 ){
                // No more digits left to increment, end of the line...
                return false;
            }
            else{
                // Can't increment this digit, cycle it to zero and continue
                // the loop to go over to the next digit...
                odometer[i_odometer_digit]=0;
                continue;
            }
        }
    }/* for( let odometer_digit = odometer.length-1; odometer_digit >=0; odometer_digit-- ) */

}/* odometer_increment() */



module.exports = {freshCards, shuffleCards, totalValues}