// module checking for enough money: ltr
// module withdrawing the money: rtl

var memoTable = {};

// input: amounts of accounts
// output: what to enter to get max amt of money
function maxExponentInput (acctValue) { // acctValue = 16
    let maxValue = [-1, [acctValue, 1]]; // maxValue = [16, [16,1]]
    let currentValue = acctValue;
    while (currentValue > 2) {
        let exponentPairs = allExponentPairs(currentValue); //exponentPairs = [[4, 2], [2, 4]]
        for (let pair of exponentPairs) { // pair =[4, 2] | [2,4]
            let current = maxHelper(pair, 0); // current = undefined | undefined | undefined
            if (current[0] > maxValue[0] || (current[0] === maxValue[0] && arrLessThan(current[1], maxValue[1]))) {
                maxValue = current;
            }
        } // maxValue = 16
        currentValue--;
    }

    assert(exponentLtr(maxValue[1]) <= acctValue);
    // post:  exponentRtl is maximal
    return maxValue[1];
} // return = [2,2,2]


// all possible splits at this index (recursive, could split by more than this index)
// move on to next index
                                                                              // index = 0      | 0
function maxHelper(items, index) {  // pair =   [4,2] | [2,4]
    let key = JSON.stringify([items, index]);
    console.log(key);
    if (items.length > 2) {
        console.log("long", key);
    }
    if (memoTable.hasOwnProperty(key)) {
        console.log("memo");
        return memoTable[key];
    } else {
        let maxValue = [exponentRtl(items), items];
        if (index >= items.length) {
        } else {
            let exponentPairs = allExponentPairs(items[index]); //  [[2, 2]] | []
            for (let pair of exponentPairs) { // split this value on some pair, or move to the next index
                let nextItems = items.slice(); // nextItems = [4,2]
                nextItems.splice(index, 1, ...pair); // nextItems = [2,2,2] 
                let current = maxHelper(nextItems, index); // [16,[2,2,2]] (stay here and split)
                if (current[0] > maxValue[0] || (current[0] === maxValue[0] && arrLessThan(current[1], maxValue[1]))) {
                    maxValue = current;
                }
            }
            // let current = maxHelper(items, index + 1);
            // if (current[0] > maxValue[0] || current[0] === maxValue[0] && arrLessThan(current[1], maxValue[1])) {
            //     maxValue = current;
            // }
        }

        memoTable[key] = maxValue;
        return maxValue;
    }
    // only split the 1st element, since we're expanding ltr
    // want to progressively go thru and split each element 
} // return = undefined | undefined | undefined

function arrLessThan(a, b) {
    let len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
        if (a[i] > b[i]) {
            return false;
        }
    }
    return true;
}

// NOTES:
// sometimes we just want values, no code whatsoever.
// option to "unbind" a helper fn from its caller and just give it a value. (helps when we decide to move down, ignore issues w/ current fn)
// also, "rebind" helper fn to a particular caller
// want to codify some of my notes (all possible splits)

function allExponentPairs(acctValue) { // acctValue = 16 | 4 | 2
    let factors = primeFactors(acctValue); // factors = [2,2,2,2] | [2,2]
    let factorBuckets = group(factors); // factorBuckets = [[2,2,2,2]] | [[2,2]]
    let ans = [];
    for (let currentPower = 2; currentPower <= Math.log2(acctValue); currentPower++) {
        if (allBucketsDivisibleBy(factorBuckets, currentPower)) {
            let currentBase = Math.round(Math.pow(acctValue, 1/currentPower));
            ans.push([currentBase, currentPower]);
            currentPower++;
        }
    }
    return ans;
} // return = [[4, 2], [2, 4]] | [[2, 2]] | []

function primeFactors(acctValue) { // acctValue = 16
    if (isPrime(acctValue)) {
        return [acctValue];
    }
    let testFactor = 2;
    while (acctValue % testFactor !== 0) {
        testFactor++;
    } 
    let otherFactor = acctValue / testFactor;
    return primeFactors(testFactor).concat(primeFactors(otherFactor));
} // return = [2,2,2,2]

function isPrime(num) {
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i == 0) {
            return false;
        }
    }
    return true;
}

function group(arr) {
    let groups = {};
    for (let item of arr) {
        if (!groups.hasOwnProperty(item)) {
            groups[item] = [];
        }
        groups[item].push(item);
    }
    let ans = [];
    for (let key in groups) {
        ans.push(groups[key]);
    }
    return ans;
}

function allBucketsDivisibleBy(buckets, num) {
    for (let item of buckets) {
        if (item.length % num !== 0) {
            return false;
        }
    }
    return true;
}

// breaks things down LTR
function exponentLtr(items) { // items = [2,3,2]
    let result = items[0]; // result = 2
    for (let i = 1; i < items.length; i++) {
        result = Math.pow(result, items[i]); // result =8 | 64  
    }
    return result; // return = 64
}

function exponentRtl(items) { // items = [2,3,2]
    let result = items.slice(-1)[0]; // 2
    for (let i = items.length - 2; i >= 0; i--) {
        result = Math.pow(items[i], result); // 9 | 512 
    }
    return result; // return = 512
}

function assert(b) {
    if (b === false) {
        throw new Error('assertion failed');
    } 
}