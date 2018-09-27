if (typeof window === 'undefined')
    eval('var VariableLiteral = require(\'./VariableLiteral\')')


class GlobalVariableSpy {
    constructor(name, runtimeSpyName, runtimeSpy) {
        this.name = name
        this.runtimeSpyName = runtimeSpyName
        this.runtimeSpy = runtimeSpy
    }

    getName() {
        return this.name
    }

    getSpyType() {
        return this.spyType
    }

    static getNewSpy(name, runtimeSpyName, runtimeSpy, theVariable) {
        if (typeof theVariable == 'function')
            return new FunctionSpy(name, runtimeSpyName, runtimeSpy)
        else {
            var functionDefinitions = VariableLiteral.getVariableLiteral(theVariable).getFunctionsDefinitions()
            functionDefinitions.forEach(functionDefinition => {
                runtimeSpy.addGlobalVariableSpy((name + functionDefinition.path),
                    functionDefinition.variable)
            })
            var newNonFunctionVariable = new NonFunctionSpy(name, runtimeSpyName, runtimeSpy)
            newNonFunctionVariable.setNewVariableLiteral('Initial', VariableLiteral.getVariableLiteral(theVariable).getLiteralAndCyclicDefinition(name))
            return newNonFunctionVariable
        }

    }
}

class NonFunctionSpy extends GlobalVariableSpy {
    constructor(name, runtimeSpyName, runtimeSpy) {
        super(name, runtimeSpyName, runtimeSpy)
        this.variableValueLiterals = new Map()
        this.spyType = 'nonFunction'
    }

    trackValueChanges(callTag, spyFunctionContextGetLiteral) {
        var newValue = spyFunctionContextGetLiteral(this.name, this.name)

        if (this.variableValueLiterals.size > 0) {
            var currentValue = Array.from(this.variableValueLiterals)[this.variableValueLiterals.size - 1][1]
            if (currentValue != spyFunctionContextGetLiteral(this.name, this.name))
                this.setNewVariableLiteral(callTag, newValue)
        }
        else {
            this.setNewVariableLiteral(callTag, newValue)
        }
    }

    getMockText() {
        var mockText = VariableLiteral.getVariableLiteral(this.variableValueLiterals).getLiteralAndCyclicDefinition(this.name + '_DB') + '\n'
        mockText += 'var ' + this.name + '\n'
        return mockText
    }

    setNewVariableLiteral(tag, literal) {
        this.variableValueLiterals.set(tag, literal)
    }

}

class FunctionSpy extends GlobalVariableSpy {
    constructor(name, runtimeSpyName, runtimeSpy) {
        super(name, runtimeSpyName, runtimeSpy)
        this.trafficData = { input: [], output: [] }
        this.functionCallIndex = 0;
        this.spyType = 'function'
    }


    getCallIndex() {
        return this.functionCallIndex
    }

    getCodeForSpy() {
        var returnCode = '{let __tempFunction = ' + this.name + '\n'
        returnCode += this.name + ' = function(){\n' +
            'return ' + this.runtimeSpyName + '.reportSpiedFunctionCallAndGetResult(' +
            '\'' + this.name.replace(/\'/g, '\\\'') + '\',arguments,' +
            'function (variable, variableName) {' +
            ' return VariableLiteral.getVariableLiteral(eval(variable)).getLiteralAndCyclicDefinition(variableName)},' +
            '__tempFunction) \n' +
            '}}\n'
        return returnCode
    }
    reportSpiedFunctionCallAndGetResult(callArguments, spyFunctionContextGetLiteral, originalSpiedFunction) {
        var callTag = this.name + '_' + this.functionCallIndex
        this.trafficData.input.push(Array.from(callArguments))
        var returnValue = originalSpiedFunction.apply(null, Array.from(callArguments))
        if (returnValue != undefined) {
            let returnedValueName = this.runtimeSpy.getNextGlobalFunctionReturnName()
            this.runtimeSpy.addGlobalVariableSpy(returnedValueName, returnValue)
            this.trafficData.output.push(returnedValueName)
        }
        else
            this.trafficData.output.push('NOVALUERETURNED')
        var toReturn = { returnValue: returnValue, callTag: callTag }
        this.functionCallIndex++
        return toReturn
    }

    getDataRepositoryText() {
        return VariableLiteral.getVariableLiteral(this.trafficData).getLiteral()
    }

}

if (typeof window === 'undefined')
    module.exports = GlobalVariableSpy
