var isNode = new Function("try {return this===global;}catch(e){return false;}");
if (isNode())
    var VariableLiteral = require('./VariableLiteral')
   

class GlobalVariableSpy {
    constructor(name, runtimeSpyName, runtimeSpy) {
        this.name = name
        this.runtimeSpyName = runtimeSpyName
        this.runtimeSpy = runtimeSpy
    }
}

if (isNode())
    module.exports = GlobalVariableSpy
