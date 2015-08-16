// describe("Cibi.Dashboard", function() {
// 	describe(" Invalid Inputs ", function() {
// 		it("should raise exception if id is not specified", function() {
// 			expect(function() {
// 				Cibi.Dashboard.create({});
// 			}).toThrow(new Error("Need to specify id"));
// 		});
// 	});

// 	describe(" Valid Inputs ", function() {
// 		var d;
// 		beforeEach(function() {
// 			d = Cibi.Dashboard.create({
// 					"id": 0,
// 					"charts": [
// 						{"type": "pie", "dimension": "dim", "group": "group"},
// 						{"type": "bar", "dimension": "dim", "group": "group"},
// 					],
// 					"title": "",
// 					"subtitle": "",
// 				});

// 		});

// 		describe("#generateCharts", function() {
// 			beforeEach(function() {
// 				d.generateCharts();
// 			});
	
// 			it("should generate 2 charts", function() {
// 				expect(_.size(d.get("chartsMap"))).toEqual(2);
// 			});

// 			it("should generate charts with correct type n indices", function() {
// 				expect(d.get("chartsMap")[0].get("type")).toEqual("pie");
// 				expect(d.get("chartsMap")[0].get("id")).toEqual(0);
// 				expect(d.get("chartsMap")[1].get("type")).toEqual("bar");
// 				expect(d.get("chartsMap")[1].get("id")).toEqual(1);
// 			});
// 		});
// 	});
// });