### Runtime Spies - Javascript
A set of tools to harness javascript legacy code into a unit test.
The main idea is to run the system in an integrative environment after adding some code. The added code captures the data going to the unit and out of it and generates code that will harness the unit in a unit test environment.

The purpose of this is to provide straight forward unit test to allow us to do refactoring.

### example (see explanation below)
This is one unit test from the project. You need to require RuntimeSpy.js for it to work.

```js
    mocha.it('Mocks', function () {

        //here are definitions of global functions and variables used in our function: 'testFunction'
        var helper1 = function (x) {

            globalVar = 2 * x
            return 2 * x
        }
        var helper2 = function (x) { return 3 * x }
        var globalVar = 5
        var globalVar2 = { 1: 6, 2: 2 }
        var b = { 1: 1, 2: globalVar2 }
        globalVar2['3'] = b

        var harness = ''
        //testFunction is the function we want to generate unit test harness for
        var testFunction = function (A) {
            // We've added the following lines to generate the harness
            var mySpy = new RuntimeSpy('mySpy') //the main spy object
            mySpy.setStartFunctionCall(arguments, 'testFunction') //capturing the function's arguments
            eval(mySpy.addVariableSpies('globalVar', 'globalVar2').getCodeToEvalToSpyOnVariables()) //spying on global variables
            eval(mySpy.addFunctionSpies('helper1', 'helper2').getCodeToEvalToSpyOnFunctions()) //spying on global functions
            //end of setup
            helper1(21) //first line of the function
            var result = helper1(A) + helper2(A) + globalVar + globalVar2['3']['2']['1'] //second line
            mySpy.addFinalResult(result) //here I tell the spy what is the end result so it can later assert on it
            harness = mySpy.getHarness() //generating the harness

            return result //third line
        }



        expect(testFunction(5)).equals(41) //This is the first run of the function, in which we generate the harness
        //The next three lines are just here to show that even though we're changing the global functioins/variables, the results with the harness will be the same
        helper1 = function (x) { return 2 }
        helper2 = function (x) { return 2 }
        globalVar = 8
        
        eval(harness) // This is the actual test run. Here we run the function with the harness. See the next section for the harness
    })
```
### The Harness
The harness generated by the above code (harness variable) is the below. You need to require Harness.js and VariableLiteral.js for it to work.
```js
        var myHarness = new Harness('myHarness')
        var mockRepositoryData = {}
        mockRepositoryData['helper1'] = {input:[[21],[5]],output:[42,10]}
        mockRepositoryData['helper2'] = {input:[[5]],output:[15]}
        myHarness.setMockRepositoryData(mockRepositoryData)
        myHarness.addFunctionMock('helper1')
        helper1= function(){
        return myHarness.callFunctionSpy('helper1',arguments,function(codeToEval){eval(codeToEval)})
        }
        myHarness.addFunctionMock('helper2')
        helper2= function(){
        return myHarness.callFunctionSpy('helper2',arguments,function(codeToEval){eval(codeToEval)})
        }
        globalVar_DB = new Map([['Initial','globalVar = 5'],['helper1_0','globalVar = 42'],['helper1_1','globalVar = 10']])
        var globalVar

        myHarness.addGlobalVariableMock('globalVar',globalVar_DB)
        globalVar2_DB = new Map([['Initial','globalVar2 = {1:6,2:2,3:{1:1}};globalVar2[\'3\'][\'2\']=globalVar2'],['helper1_0','globalVar2 = {1:6,2:2,3:{1:1}};globalVar2[\'3\'][\'2\']=globalVar2'],['helper1_1','globalVar2 = {1:6,2:2,3:{1:1}};globalVar2[\'3\'][\'2\']=globalVar2'],['helper2_0','globalVar2 = {1:6,2:2,3:{1:1}};globalVar2[\'3\'][\'2\']=globalVar2']])
        var globalVar2

        myHarness.addGlobalVariableMock('globalVar2',globalVar2_DB)
        myHarness.updateVariablesByTag('Initial',function(codeToEval){eval(codeToEval)})
        testFunctionParam0 = 5
        expect(VariableLiteral.getVariableLiteral(testFunction(testFunctionParam0)
        ).getLiteralAndCyclicDefinition('result')).equals('result = 41')
```

Good luck :-)

Contact me for any querie or comment: yaki.koren@gmail.com OR yaki@agilesparks.com

#### copyright notice

Copyright (C) 2018 [Yaki Koren](http://github.com/Yakik)
 
Redistribution, modification and use of this source code is allowed. You do need to mention the copyright.
This software is intended to be used in a test environment only.
