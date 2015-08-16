// describe("Cibi.config", function() {
//   var configs = {
//     "configs" : {
//       "data": [{
//         'data_file' : "/data/somefile.csv",
//         'dimensions' : [
//           'dim1',
//           'dim2',
//           'dim3'
//         ]
//       }]
//     }
//   };    
//   beforeEach(function() {
//     spyOn(d3, "csv");
//   })

//   describe("#constructor", function() {
//     var c;
//     beforeEach(function() {
//       spyOn($, "ajax").andCallFake(function(data) {
//         data.success(JSON.stringify(configs));
//       });
//       c = Cibi.Config.create();
//     });


//     it("should be defined", function() {
//       expect(c).toNotBe(undefined);
//     });

//     it("should read configs", function() {
//       expect(c.get("configs")).toEqual(configs.configs);
//     });
//   });

//   describe("#parse", function() {
//     var d;
    
//     beforeEach(function() {
//       spyOn($, "ajax").andCallFake(function(data) {
//         data.success(JSON.stringify(configs));
//       });
//       d = Cibi.Data.create(
//         {"dataFile": configs.configs.data[0].data_file, 
//         "dimensions": configs.configs.data[0].dimensions}
//       );
//       spyOn(Cibi.Data, "create").andReturn(d);
//       c = Cibi.Config.create();
//     });

//     it("should have data modules", function() {
//       expect(c.data[0]).toEqual(d);
//     });
//   })
// });
// 	