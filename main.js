maxExponentInput(16); // 1025
flameGraph($('#visualization'), calls, rootCall);

// * elision of unnecessary values
// * see the arguments to a function

// * read graph rtl?
// * zoom out / in to see whole graph
// * sync graph with IOP view

// * diversity metric to see examples 
//      * coverage
//      * returns different type
// * system riffs off of examples
// *  funciton that returns a selection of call objects that pass an arbitrary predicate
// * reify necessary features (dom -> call, call -> dom)

// * call stack
// * store, show scope

// * manipulation
//      * collapse (call and subcalls)

/**
    * where are the base cases?
    * where are the args undefined?
    * where are the cases 1 off from base case?
    * where are all the calls to shift?
    * that are made from a call in the stack? // make global variable called 'stack'
    * that are made from a call in the current fn? // last elt in stack is current fn
    * fn that was called n times? // query each call, effect is to increment counter
    * the i - k th calls of an fn // query each call. effect is to write into calls, access item in 2nd query
    * read dynamic scope
    * trace var/value
    * pronouns (point to var/value in scope)
 */

var queries = [];

//      * color palette (a,b,c,d,e,f)
var swatches = d3.scaleLinear()
    .domain([1, 7])
    .range([d3.hcl(0, 30, 80), d3.hcl(360, 30, 80)])
    .interpolate(d3.interpolateHclLong);

d3.select($("#colors"))
        .attr('width', 500)
        .attr('height', 70)
    .selectAll("circle.swatch")
    .data([1,2,3,4,5,6])
    .enter().append('circle')
        .attr('class', 'swatch')
        .attr('cx', datum => datum * 50)
        .attr('cy', 50)
        .attr('r', 10)
        .attr('fill', swatches)
        .on('click', datum => {
            queries[datum]();
        })
        .append('svg:title')
            .text(datum => datum)
    .exit().remove();

var weights = d3.scaleLinear()
    .domain([1,9])
    .range([100,900]);

d3.select($('#weights'))
        .attr('width', 500)
        .attr('height', 70)
    .selectAll('text.swatch')
    .data([1,2,3,4,5,6,7,8,9])
    .enter().append('text')
        .attr('class', 'swatch')
        .text('a')
        .attr('x', datum => -4 + datum * 50)
        .attr('y', 25)
        .style('font-weight', weights)
        .style('font-family',  'Cooper Hewitt, input mono compressed')
        .append('svg:title')
            .text(datum => datum)
    .exit().remove();

// QUERIES

var oneOffFromBaseCase = query(call =>
    call.fnName === 'primeFactors' &&
    call.children.every(child => 
        child.fnName !== 'primeFactors' || 
        baseCase('primeFactors')(child) 
    )
);

//      * baseCase
function baseCase(fnName) {
    return function(call) {
        return call.fnName === fnName &&
        call.children.every(child => child.fnName !== fnName)
    };
}

//      * rootCase 
function rootCase(fnName) {
    return function(call) {
        return call.fnName === fnName &&
        call.parent.fnName !== fnName;
    }
}

function deepEquals(a, b) {
    if (typeof a !== typeof b) {
        return false;
    } else if (typeof a === 'object') {
        return Object.keys(a).every(key => deepEquals(a[key], b[key])) &&
            Object.keys(b).every(key => deepEquals(a[key], b[key]));
    } else {
        return a === b;
    }
}

function callsWithSameArgument(fnName) {
    let sameArg = {};
    let argSets = [];
    forEachCall(
        call => {
            let c = argSets.find(c => deepEquals(c.args, call.args));
            if (c !== undefined ) {
                sameArg[c.uid] = true;
                sameArg[call.uid] = true;
            } else {
                sameArg[call.uid] = false;
                argSets.push(call);
            }
        }, 
        call => call.fnName === fnName);
    return function(call) {
        return sameArg[call.uid];
    };
}

function nCalls(fnName, n) {
    let sameParent = {};
    forEachCall(
        call => {
            if (call.parent !== null && !sameParent.hasOwnProperty(call.parent.uid)) {
                sameParent[call.parent.uid] = 1;
            } else if (call.parent !== null) {
                sameParent[call.parent.uid]++;
            }
        },
        call => call.fnName === fnName
    );
    return function(call) {
        return call.parent !== null && call.fnName === fnName && sameParent[call.parent.uid] === n;
    };
}

var groupCalls = query(call => call.fnName === 'group');
var baseCases = query(baseCase('primeFactors'));
var rootCases = query(rootCase('primeFactors'));
var undefinedArgs = query(call =>
    call.args.some(arg => arg === undefined)
);
var sameArgs = query(callsWithSameArgument('primeFactors'));
let sameArgsPred = callsWithSameArgument('primeFactors');
var notSameArgs = query(function(call) { return call.fnName === 'primeFactors' && !sameArgsPred(call) });

var sameArgsHelper = query(callsWithSameArgument('maxHelper'));
var sameArgsExponentPairs = query(callsWithSameArgument('allExponentPairs'));
var allBucketsDivisibleByCalled2Times = query(nCalls('allBucketsDivisibleBy', 2));

queries[1] = (function() {
    let enabled = false;
    return function() {
        if (enabled) {
            groupCalls.select('rect').style('fill', 'none'); //style('stroke', d3.hcl(0, 0, 80)).style('stroke-width', 1);
        } else {
            groupCalls.select('rect').style('fill', swatches(1)); //style('stroke', 'black').style('stroke-width', 2);            
        }
        enabled = !enabled;
    } 
})();

queries[2] = (function() {
    let enabled = false;
    return function() {
        if (enabled) {
            rootCases.select('rect').style('fill', 'none');
        } else {
            rootCases.select('rect').style('fill', swatches(2));            
        }
        enabled = !enabled;
    } 
})();

queries[3] = (function() {
    let enabled = false;
    return function() {
        if (enabled) {
            baseCases.select('rect').style('fill', 'none');
        } else {
            baseCases.select('rect').style('fill', swatches(3));            
        }
        enabled = !enabled;
    } 
})();

queries[4] = (function() {
    let enabled = false;
    return function() {
        if (enabled) {
            sameArgs.select('rect').style('fill', 'none');
        } else {
            sameArgs.select('rect').style('fill', swatches(4));            
        }
        enabled = !enabled;
    } 
})();

queries[5] = (function() {
    let enabled = false;
    return function() {
        if (enabled) {
            allBucketsDivisibleByCalled2Times.select('rect').style('fill', 'none');
        } else {
            allBucketsDivisibleByCalled2Times.select('rect').style('fill', swatches(5));    
        }
        enabled = !enabled;
    } 
})();

queries[6] = (function() {
    let enabled = false;
    return function() {
        if (enabled) {
            sameArgsExponentPairs.select('rect').style('fill', 'none');
        } else {
            sameArgsExponentPairs.select('rect').style('fill', swatches(6));
        }
        enabled = !enabled;
    } 
})();

// groupCalls.select('rect').style('stroke', 'black').style('stroke-width', 2);
// baseCases.select('rect').style('fill', swatches(1));
// rootCases.select('rect').style('fill', swatches(2));
// sameArgs.select('rect').style('fill', swatches(3));
// notSameArgs.select('rect').style('fill', swatches(3));
// sameArgsHelper.select('rect').style('fill', swatches(5));
// sameArgsExponentPairs.select('rect').style('fill', swatches(6));
// allBucketsDivisibleByCalled2Times.select('rect').style('fill', swatches(4));

