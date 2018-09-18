var chai = require('chai')
var expect = chai.expect
var CodeDefinition = require('./Variable')

var getMockFunction = function (functionName, mockDataSourceVariable) {
	return function(){
		checkMockDataReadiness(functionName,mockDataSourceVariable)
		mockDataSource=assertInput(functionName,arguments,mockDataSourceVariable)
        var output=getOutput(functionName,mockDataSourceVariable)
        mockDataSource = output.mockDataSource
		return output.output
		}
}

var checkMockDataReadiness = function (functionName,mockDataSource) {
    if (mockDataSource[functionName].inputIndex == undefined) 
        mockDataSource[functionName].inputIndex = 0
        if (mockDataSource[functionName].outputIndex==undefined) 
		mockDataSource[functionName].outputIndex=0
	return mockDataSource
}

var assertInput = function (functionName, callArguments,mockDataSource) {
    expect(CodeDefinition.getVariable(mockDataSource[functionName].
        input[mockDataSource[functionName].inputIndex]).getLiteral()).
        equals(CodeDefinition.getVariable(Array.from(callArguments)).getLiteral())
    mockDataSource[functionName].inputIndex++
    return mockDataSource
 }
var getOutput = function (functionName,mockDataSource) {
	var output = mockDataSource[functionName].output[mockDataSource[functionName].outputIndex]
    mockDataSource[functionName].outputIndex++
    return { mockDataSource: mockDataSource, output: output }
}
 
module.exports.getMockFunction = getMockFunction
module.exports.checkMockDataReadiness = checkMockDataReadiness
module.exports.assertInput = assertInput
module.exports.getOutput = getOutput