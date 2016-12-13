var functions = {};
var calls = {};
var currentCall = null;
var rootCall = null;

var nextUid = 0;

class FnCall {
    constructor(fnName, parent, args) {
        this.fnName = fnName;
        this.args = Array.prototype.slice.call(args);
        
        this.uid = nextUid++;

        this.parent = parent;
        this.children = [];
        if (this.parent !== null) {
            this.parent.children.push(this);
        }
    }

    get fn() {
        return functions[this.fnName];
    }

    get level() {
        if (this.parent === null) {
            return 0;
        }

        if (!this.hasOwnProperty('_level')) {
            this._level = this.parent.level + 1;
        }
        return this._level;
    }

    height(base, padding, readFromCache = false) {
        if (readFromCache === true) {
            return this._height;
        }

        if (this.children.length === 0) {
            this._height = base;
        } else {
            let total = this.children
                .map(child => child.height(base, padding, readFromCache))
                .reduce((agg, b, i, arr) => i < (arr.length - 1) ? padding + agg + b : agg + b, 0);
            this._height = total;
        }
        return this._height;
    }

    calculateY(base, padding) {
        if (this.parent === null) {
            this.y = 0;
        }

        let childY = this.y;
        this.children.forEach(child => {
            child.y = childY;
            child.calculateY(base, padding);
            childY += child.height(base, padding, true) + padding;
        });
    }

    cache() {
        if (!calls.hasOwnProperty(this.fnName)) {
            calls[this.fnName] = [];
        }
        calls[this.fnName].push(this);
    }
}

function ENTER(fn, fnName, args) {
    if (!functions.hasOwnProperty(fnName)) {
        functions[fnName] = fn;
    }


    let call = new FnCall(fnName, currentCall, args);
    if (Object.keys(calls).length === 0) {
        rootCall = call;
    }
    call.cache();
    currentCall = call;
}

function LEAVE(returnValue) {
    currentCall.returnValue = returnValue;
    currentCall = currentCall.parent;
    return returnValue;
}

function CLEAR() {
    functions = {};
    calls = {};
    currentCall = null;
    nextUid = 0;
}




//-----------------------------------------------------

// module checking for enough money: ltr
// module withdrawing the money: rtl

// input: amounts of accounts
// output: what to enter to get max amt of money
function maxExponentInput (acctValue) { // acctValue = 16
    ENTER(maxExponentInput, 'maxExponentInput', arguments);

    let maxValue = [-Infinity, [acctValue, 1]]; // maxValue = [16, [16,1]]
    let currentValue = acctValue;
    while (currentValue > 2) {
        let exponentPairs = allExponentPairs(currentValue); //exponentPairs = [[4, 2], [2, 4]]
        for (let pair of exponentPairs) { // pair =[4, 2] | [2,4]
            let current = maxHelper(pair, 0); // current = undefined | undefined | undefined
                if (current[0] >= maxValue[0]) {
                    maxValue = current;
                }
        } // maxValue = 16
        currentValue--;
    }

    assert(exponentLtr(maxValue[1]) <= acctValue);
    // post:  exponentRtl is maximal
    return LEAVE(maxValue[1]);
} // return = [2,2,2]


// all possible splits at this index (recursive, could split by more than this index)
// move on to next index
                                                                              // index = 0      | 0
function maxHelper(items, index) {  // pair =   [4,2] | [2,4]
    ENTER(maxHelper, 'maxHelper', arguments);

    let maxValue = [exponentRtl(items), items];
    if (index >= items.length) {
        return LEAVE(maxValue);
    } else {
        let exponentPairs = allExponentPairs(items[index]); //  [[2, 2]] | []
        for (let pair of exponentPairs) { // split this value on some pair, or move to the next index
            let nextItems = items.slice(); // nextItems =[4,2]
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
        return LEAVE(maxValue);
    }
    // only split the 1st element, since we're expanding ltr
    // want to progressively go thru and split each element 
} // return = undefined | undefined | undefined

function arrLessThan(a, b) {
    ENTER(arrLessThan, 'arrLessThan', arguments);

    let len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
        if (a[i] > b[i]) {
            return LEAVE(false);
        }
    }

    return LEAVE(true);
}

// NOTES:
// sometimes we just want values, no code whatsoever.
// option to "unbind" a helper fn from its caller and just give it a value. (helps when we decide to move down, ignore issues w/ current fn)
// also, "rebind" helper fn to a particular caller
// want to codify some of my notes (all possible splits)

function allExponentPairs(acctValue) { // acctValue = 16 | 4 | 2
    ENTER(allExponentPairs, 'allExponentPairs', arguments);

    let factors = primeFactors(acctValue); // factors = [2,2,2,2] | [2,2]
    let factorBuckets = group(factors); // factorBuckets = [[2,2,2,2]] | [[2,2]]
    let ans = [];
    for (let currentPower = 2; currentPower <= Math.log2(acctValue); currentPower++) {
        if (allBucketsDivisibleBy(factorBuckets, currentPower)) {
            let currentBase = Math.pow(acctValue, 1/currentPower);
            ans.push([currentBase, currentPower]);
            currentPower++;
        }
    }

    return LEAVE(ans);
} // return = [[4, 2], [2, 4]] | [[2, 2]] | []

function primeFactors(acctValue) { // acctValue = 16
    ENTER(primeFactors, 'primeFactors', arguments);

    if (isPrime(acctValue)) {
        
        return LEAVE([acctValue]);
    }
    let testFactor = 2;
    while (acctValue % testFactor !== 0) {
        testFactor++;
    } 
    let otherFactor = acctValue / testFactor;
    let primeTest = primeFactors(testFactor);
    let primeOther = primeFactors(otherFactor);

    return LEAVE(primeTest.concat(primeOther));
} // return = [2,2,2,2]

function isPrime(num) {
    ENTER(isPrime, 'isPrime', arguments);

    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i == 0) {
            
            return LEAVE(false);
        }
    }
    
    return LEAVE(true);
}

function group(arr) {
    ENTER(group, 'group', arguments);

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
    
    return LEAVE(ans);
}

function allBucketsDivisibleBy(buckets, num) {
    ENTER(allBucketsDivisibleBy, 'allBucketsDivisibleBy', arguments);

    for (let item of buckets) {
        if (item.length % num !== 0) {
            
            return LEAVE(false);
        }
    }
    
    return LEAVE(true);
}

// breaks things down LTR
function exponentLtr(items) { // items = [2,3,2]
    ENTER(exponentLtr, 'exponentLtr', arguments);

    let result = items[0]; // result = 2
    for (let i = 1; i < items.length; i++) {
        result = Math.pow(result, items[i]); // result =8 | 64  
    }
    
    return LEAVE(result); // return = 64
}

function exponentRtl(items) { // items = [2,3,2]
    ENTER(exponentRtl, 'exponentRtl', arguments);

    let result = items.slice(-1)[0]; // 2
    for (let i = items.length - 2; i >= 0; i--) {
        result = Math.pow(items[i], result); // 9 | 512 
    }
    
    return LEAVE(result); // return = 512
}

function assert(b) {
    ENTER(assert, 'assert', arguments);
    if (b === false) {
        
        throw LEAVE(new Error('assertion failed'));
    } 
    LEAVE(undefined);
}