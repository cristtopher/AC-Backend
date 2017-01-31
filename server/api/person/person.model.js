'use strict';

import Promise from 'bluebird';
import mongoose from 'mongoose';
import xlsx from 'node-xlsx';

var readFileAsync = Promise.promisify(require('fs').readFile);


var PersonSchema = new mongoose.Schema({
  rut:     { type: String },
  name:    { type: String },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  type:    { type: String, enum: ['staff', 'contractor', 'visitor'], default: 'staff' },
  card:    { type: Number },
  active:  { type: Boolean }
});

PersonSchema.index({ rut: 1 }, { unique: true });
PersonSchema.index({ card: 1 }, { unique: true });
PersonSchema.index({ company: 1 });


//-------------------------------------------------------
//                     Statics
//-------------------------------------------------------

PersonSchema.statics = {
  dummyExcel: function() {
    const data = [[1, 2, 3], [true, false, null, 'sheetjs'], ['foo', 'bar', new Date('2014-02-19T14:30Z'), '0.3'], ['baz', null, 'qux']];
    var buffer = xlsx.build([{ name: 'mySheetName', data: data }]);
    
    return new Promise(resolve => resolve(buffer));
  },
  
  importExcel: function(filePath) {
    return readFileAsync(filePath)
      .then(xlsx.parse)
      .then(function(excel){
        let sheet = excel[0];
        
        sheet.data.forEach((row, i) => {
          row.forEach((val, j) => {
            console.log(`excel[${i + 1}][${String.fromCharCode(97 + j).toUpperCase()}] = ${val}`);
          });
        });
      });
  }
};

export default mongoose.model('Person', PersonSchema);
