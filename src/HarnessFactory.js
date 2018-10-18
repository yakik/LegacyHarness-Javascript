var RuntimeSpy = require('./RuntimeSpy')

const mockRepositoryDataName = 'mockRepositoryData'
class HarnessFactory {
	constructor(harnessName, globalVariablesSpies, functionSpies, initialFunctionName, resultLiteral, testFunctionCall) {
		this.harnessName = harnessName
		this.globalVariablesSpies = globalVariablesSpies
		this.functionSpies = functionSpies
		this.initialFunctionName = initialFunctionName
		this.resultLiteral = resultLiteral
		this.testFunctionCall = testFunctionCall
	}

	getHarnessCode() {
		var harnessText = 'var myHarness = new Harness(\'' + this.harnessName + '\')\n'
		harnessText += this.getDataRepositoryText()
		harnessText += 'myHarness.setMockRepositoryData(' + mockRepositoryDataName + ')\n'
		harnessText += this.getVariableMocksText()
		harnessText += this.getFunctionMocksText()
		if (this.testFunctionCall != "EMPTY") {
			if (this.resultLiteral == undefined)
				harnessText += this.testFunctionCall
			else {
				harnessText += 'expect(VariableLiteral.getVariableLiteral(' + this.testFunctionCall + ').getLiteralAndCyclicDefinition(\'result\')' +
					').equals(\'' + this.resultLiteral.replace(/\'/g, '\\\'').replace(/\n/g, '\\n') + '\')\n'
			}
		}
		return harnessText
	}

	getDataRepositoryText() {
		var repositoryText = 'var ' + mockRepositoryDataName + ' = {}\n'
		this.functionSpies.forEach(functionSpy => {
			repositoryText += mockRepositoryDataName + '[\'' + functionSpy.getName().replace(/\'/g, '\\\'') + '\']' +
				' = ' + functionSpy.getDataRepositoryText() + '\n'
		})

		return repositoryText
	}

	getFunctionMocksText() {
		var mocksText = ''
		this.functionSpies.forEach((functionSpy) => {
			mocksText += this.harnessName + '.addFunctionMock(\'' + functionSpy.getName().replace(/\'/g, '\\\'') + '\')\n'
			mocksText += functionSpy.getName() + '= function(){\n' +
				'var returnValue =  ' + this.harnessName + '.callFunctionSpy(\'' + functionSpy.getName().replace(/\'/g, '\\\'') + '\',' +
				'arguments,' +
				'function(codeToEval){eval(codeToEval)})\n' +
				'if (returnValue!=\'NOVALUERETURNED\')' +
				'return eval(returnValue)\n' +
				'}\n'
		})

		return mocksText
	}


	getVariableMocksText() {
		var mocksText = ''
		this.globalVariablesSpies.forEach((variableSpy) => {
			mocksText += variableSpy.getMockText() + '\n'
			mocksText += this.harnessName + '.addGlobalVariableMock(' +
				'\'' + variableSpy.getName() + '\',' +
				variableSpy.getName() + '_DB)\n'

		})
		mocksText += this.harnessName + '.updateVariablesByTag(\'Initial\',' +
			'function(codeToEval){eval(codeToEval)})\n'
		return mocksText
	}


}

module.exports = HarnessFactory