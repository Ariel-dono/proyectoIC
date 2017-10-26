describe("Set Name Layer", function() {
  var test1;
  beforeEach(function() {
	test1 = new setNameLayer("test1","test2");
  });

  it("set id layer", function() {
    expect(test1.id).toEqual("test1");   
  });
  
  it("set type layer", function() {  
	expect(test1.type).toEqual("test2"); 
  });
  
  it("set id layer 2", function() {
    expect(test1.id).not.toEqual("test2");   
  });
  
  it("set type layer 2", function() {  
	expect(test1.type).not.toEqual("test1"); 
  });
 
});

describe("exist collision", function() {
  var test1;
  beforeEach(function() {
	test1 = new existCollision("test1","test2");
  });

  it("exist collision", function() {
    expect(test1).toEqual(false);   
  });
  
 
  
 
});





