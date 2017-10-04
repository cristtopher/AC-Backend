'use strict';

import Promise from 'bluebird';

import mongoose from 'mongoose';
import xlsx from 'node-xlsx';
import moment from 'moment';
import * as _ from 'lodash';

import Register from '../register/register.model';
import Sector from '../sector/sector.model';
import Person from '../person/person.model';

mongoose.Promise = Promise;
var readFileAsync = Promise.promisify(require('fs').readFile);

var CompanySchema = new mongoose.Schema({
  name:        { type: String },
  logo:        { type: String },
  description: { type: String }
});

CompanySchema.statics = {
  getStatistics: function(companyId) {
    let now = new Date();

    var _getCompanySectorsPromise = function() {
      return Sector.find({ company: companyId }).exec();
    };
    
    var _getIncompleteRegistersPromise = function(sectors) {
      return Register.find({})
                     .where('sector').in(sectors)
                     .where('isUnauthorized').equals(false)
                     .where('type')
                     .equals('entry')
                     .where('isResolved')
                     .equals(false)
                     .exec();
    };
    
    var _getWeeklyRegisterDataPromise = function(sectors) {
      return Register.find({})
                     .where('sector').in(sectors)
                     .where('isUnauthorized').equals(false)
                     .where('time')
                     .gte(moment(now)
                     .subtract(8, 'days'))
                     .populate('person')
                     .exec();
    };

    return _getCompanySectorsPromise().then(function(sectors) {
      return Promise.all([
        _getIncompleteRegistersPromise(sectors),
        _getWeeklyRegisterDataPromise(sectors),
      ]);
    })
    .spread(function(incompleteRegisters, weeklyRegisters) {      
      let keyList = [];
      let dataRedux = [];
      
      for(var e in incompleteRegisters) {
        if(!_.includes(keyList, incompleteRegisters[e].person.toString())) {
          keyList.push(incompleteRegisters[e].person.toString());
          dataRedux.push(incompleteRegisters[e]);
        }
      }

      return {
        supplierCount: _.filter(dataRedux, r => r.personType === 'supplier').length,
        staffCount: _.filter(dataRedux, r => r.personType === 'staff').length,
        contractorCount: _.filter(dataRedux, r => r.personType === 'contractor').length,
        visitCount: _.filter(dataRedux, r => r.personType === 'visitor').length,
        weeklyRegisters: weeklyRegisters
      };  
    });    
  },
  
  getRegisters: function(companyId, query) {    
    return Sector.find({ company: companyId }).exec()
      .then(function(sectors) { 
        let baseRegisterQuery = Register.find();
        
        if(query.top) {
          baseRegisterQuery.limit(parseInt(query.top, 10));
        }        
        
        return baseRegisterQuery.find()
          .populate('person sector resolvedRegister')
          .where('isUnauthorized').equals(false)
          .where('sector').in(sectors)
          .sort({ _id: -1 })
          .exec();
      });
  },
  
  exportExcel: function(userCompanyId) {
    var data = [['RUT', 'NOMBRE', 'EMPRESA', 'PERFIL', 'CARD', 'ESTADO']];

    return mongoose.model('Person').find({company: userCompanyId})
      .populate('company')
      .exec()
      .then(function(persons) {
        for(var i in persons) {
          if(persons[i].active) {
            var rowA = [persons[i].rut, persons[i].name, persons[i].companyInfo, persons[i].type, persons[i].card, 'Activo'];
            data.push(rowA);
          } else {
            var rowI = [persons[i].rut, persons[i].name, persons[i].companyInfo, persons[i].type, persons[i].card, 'Inactivo'];
            data.push(rowI);
          }
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
        
        let pendingPromises = []; 
        let rutArray = [];
        
        sheet.data.forEach((row, i) => {
          var status = {
            activo: true,
            inactivo: false
          };

          if(i > 0) {
            rutArray.push(row[0]);

            pendingPromises.push(Person.findOne({ rut: row[0], company: userCompanyId }).exec()
              .then(personR => {
                if(personR) {
                  var id = personR._id;

                  if(row[4]) {
                    console.log('Card defined ok');
                  } else {
                    console.log('Card not defined. Setting as -1');
                    row[4] = -1;
                  }

                  var body = {
                    name: row[1], 
                    company: userCompanyId,
                    companyInfo: row[2],
                    type: row[3] ? row[3].toLowerCase() : undefined,
                    card: row[4],
                    active: row[5] ? status[row[5].toLowerCase()] : undefined
                  };
                
                  return Person.findOneAndUpdate({_id: id}, body, { upsert: true, setDefaultsOnInsert: true, runValidators: true, new: true }).exec();
                } else {
                  var personCreate = new Person();
                
                  personCreate.rut         = row[0];
                  personCreate.name        = row[1];
                  personCreate.company     = userCompanyId;
                  personCreate.companyInfo = row[2];
                  personCreate.type        = row[3] ? row[3].toLowerCase() : undefined;
                  personCreate.card        = row[4];
                  personCreate.active      = row[5] ? status[row[5].toLowerCase()] : undefined;

                  return personCreate.save();
                }
              }));
          }
        });
        
        var data = [['Import Excel Results'], [], ['RUT', 'RESULT', 'ERROR'], []];
        let errors = 0;

        return Promise.all(pendingPromises.map(promise => promise.reflect()))
          .each((inspection, idx) => {
            if(inspection.isFulfilled()) {
              data.push([rutArray[idx], 'Success']);
            } else {
              console.log('FAIL', rutArray[idx], JSON.stringify(inspection.reason()));
              errors = 1;

              if(JSON.stringify(inspection.reason()).indexOf('Cast to number failed') !== -1) {
                console.log('No fue posible convertir un string a numero');
                data.push([rutArray[idx], 'Failed', 'No fue posible convertir texto a numero']);
              } else if(JSON.stringify(inspection.reason()).indexOf('duplicate key error index') !== -1) {
                console.log('Datos duplicados no cumplen con el modelo');
                data.push([rutArray[idx], 'Failed', 'Duplicado']);
              } else if(JSON.stringify(inspection.reason()).indexOf('Path `rut` is required') !== -1) {
                console.log('Rut no fue especificado');
                data.push([rutArray[idx], 'Failed', 'Falta Rut']);
              } else if(JSON.stringify(inspection.reason()).indexOf('Path `type` is required') !== -1) {
                console.log('Perfil no fue especificado');
                data.push([rutArray[idx], 'Failed', 'Falta Perfil']);
              } else if(JSON.stringify(inspection.reason()).indexOf('Path `active` is required') !== -1) {
                console.log('Estado no fue especificado');
                data.push([rutArray[idx], 'Failed', 'Falta Estado']);
              } else {
                console.log('Excepcion no capturada. Imprimiendo excepcion completa', JSON.stringify(inspection.reason()));
                data.push([rutArray[idx], 'Failed', 'Excepcion no capturada:' + JSON.stringify(inspection.reason())]);
              }

            }
          })
          .then(() => {
            return [errors, xlsx.build([{ name: 'mySheetName', data: data }])];
          });
      });    
  },
  
  createPerson: function(companyId, personData) {
    return Person.create(Object.assign(personData, { company: companyId }));
  }
};

CompanySchema.index({ name: 1 });

export default mongoose.model('Company', CompanySchema);
