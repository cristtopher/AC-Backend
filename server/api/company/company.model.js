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
      var _weeklyHistory = {
        entry: [],
        depart: []
      };
      
      for(var i = 0; i <= 6; i++) {
        let upperDate = i == 0 ? now : moment(now).startOf('day').subtract(i - 1, 'days');  
        let lowerDate = i == 0 ? moment(now).startOf('day') : moment(now).startOf('day').subtract(i, 'days');
        
        let timeFilteredRegisters = _.filter(weeklyRegisters, r => r.time < upperDate && r.time > lowerDate);
        
        let entriesFound = _.filter(timeFilteredRegisters, r => r.type === 'entry');
        let departsFound = _.filter(timeFilteredRegisters, r => r.type === 'depart');
    
        console.log(`for ${lowerDate.toDate()} => entriesFound: ${entriesFound.length}, departsFound: ${departsFound.length}`);
    
        _weeklyHistory.entry.push({ datetime: lowerDate.unix() * 1000, count: _.size(entriesFound) });
        _weeklyHistory.depart.push({ datetime: lowerDate.unix() * 1000, count: _.size(departsFound) });
      }

      var keyList = [];
      var dataRedux = [];
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
        weeklyHistory: _weeklyHistory
      };  
    });    
  },
  
  getRegisters: function(companyId, query) {    
    return Sector.find({ company: companyId }).exec()
      .then(function(sectors) { 
        let baseRegisterQuery = Register.find();
        
        if (query.top) {
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

          if( i > 0 ) {
            rutArray.push(row[0]);

            pendingPromises.push(Person.findOne({ rut: row[0] }).exec()
              .then(personR => {
                if(personR) {
                  var id = personR._id;

                  var body = {
                    name: row[1], 
                    company: userCompanyId,
                    companyInfo: row[2],
                    type: row[3].toLowerCase(),
                    card: row[4],
                    active: status[row[5].toLowerCase()]
                  };
                
                  return Person.findOneAndUpdate({_id: id}, body, { upsert: true, setDefaultsOnInsert: true, runValidators: true, new: true }).exec();
                } else {
                  var personCreate = new Person();
                
                  personCreate.rut         = row[0];
                  personCreate.name        = row[1];
                  personCreate.company     = userCompanyId;
                  personCreate.companyInfo = row[2];
                  personCreate.type        = row[3].toLowerCase();
                  personCreate.card        = row[4];
                  personCreate.active      = status[row[5].toLowerCase()];

                  return personCreate.save();
                }
              }));
          }
        });
        
        var data = [['Import Excel Results'], [], ['RUT', 'RESULT', 'ERROR'], []];

        return Promise.all(pendingPromises.map(promise => promise.reflect()))
          .each((inspection, idx)  => {
            if(inspection.isFulfilled()){
              //console.log(idx, `OK`);
              data.push([rutArray[idx], 'Success']);
            } else {
              //console.log(idx, `NOT OK REASON`, JSON.stringify(inspection.reason().errors));
              data.push([rutArray[idx], 'Failed', JSON.stringify(inspection.reason().errors)]);
            }
          })
          .then(() => {
            return xlsx.build([{ name: 'mySheetName', data: data }]);;
          })
      });    
  },
  
  createPerson: function(companyId, personData) {
    return Person.create(Object.assign(personData, { company: companyId }));
  }
};

CompanySchema.index({ name: 1 });

export default mongoose.model('Company', CompanySchema);
