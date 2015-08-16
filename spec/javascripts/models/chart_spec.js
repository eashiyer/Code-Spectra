// describe("Cibi.Chart", function() {
// 	describe(" Invalid Inputs ", function() {
// 		it("Should raise 'Chart Type not found' Exception", function() {
// 			expect(
// 				function() { 
// 					Cibi.Chart.create(); 
// 			}).toThrow(new Error("Chart Type not specified"));
// 			expect(
// 				function() { 
// 					Cibi.Chart.create({"type": "pie"}); 
// 			}).toThrow(new Error("ID not specified"));
// 		});
// 	});

// 	describe(" Valid Inputs", function() {
// 		var c;
// 		beforeEach(function() {
// 			c = Cibi.Chart.create({"type": "bar", "id": 0, "dash_id": 0, "dimension": "dim1", "group": "group"})
// 		});

// 		it("should create a valid chart object", function() {
// 			expect(c.get("obj")).toNotBe(null);
// 		});
// 	});
// });