var TestClass = /** @class */ (function () {
    function TestClass() {
        this.text = 'Lorem ipsum';
    }
    TestClass.prototype.myFirstMethod = function () {
        try {
            console.log(this.text);
        }
        catch (ex) { }
    };
    return TestClass;
}());
