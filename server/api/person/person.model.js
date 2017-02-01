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
  dummyExcel: function(userCompanyId) {
    var data = [['RUT', 'NOMBRE', 'EMPRESA', 'PERFIL', 'CARD']];

    return mongoose.model('Person').find({company: userCompanyId})
      .populate('company')
      .exec()
      .then(function(persons) {
        for(var i in persons) {
          var row = [persons[i].rut, persons[i].name, persons[i].company.name, persons[i].type, persons[i].card];
          data.push(row);
        }
      })
      .then(function() {
        var buffer = xlsx.build([{ name: 'mySheetName', data: data }]);
        return new Promise(resolve => resolve(buffer));
      });
  },
  
  importExcel: function(filePath, userCompanyId) {
    return readFileAsync(filePath)
      .then(xlsx.parse)
      .then(function(excel) {
        let sheet = excel[0];
        
        sheet.data.forEach((row, i) => {
          console.log(userCompanyId);
          var Person = mongoose.model('Person', PersonSchema);

          if(i > 0) {
            //if(row[5] == 'Activo') {
            Person.findOne({rut: row[0]}, function(err, personR) {
              if(err) {
                console.log(err);
                return;
              }

              if(personR) {
                console.log('Updating Row');
                personR.name = row[1];
                personR.company = userCompanyId;
                personR.type = row[3].toLowerCase();
                personR.card = row[4];
                personR.update();
              } else {
                console.log('Creating Row');
                var personCreate = Person();
                personCreate.rut = row[0];
                personCreate.name = row[1];
                personCreate.company = userCompanyId;
                personCreate.type = row[3].toLowerCase();
                personCreate.card = row[4];
                personCreate.save();
              }
            });
          }
            //} else if(row[5] == 'Inactivo') {
            //  Person.findOne({rut: row[0]}, function(err, personR) {
            //    if(err) {
            //      console.log(err);
            //      return;
            //    }

            //    console.log('Deleting Row');
            //    if(personR) {
            //      personR.remove();
            //    }
            //  });
        });
      });
  }
};

export default mongoose.model('Person', PersonSchema);
