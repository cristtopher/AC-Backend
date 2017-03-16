'use strict';

import Promise from 'bluebird';

import mongoose from 'mongoose';
import moment from 'moment';
import * as _ from 'lodash';
import xlsx from 'node-xlsx';

import Register from '../register/register.model';

var SectorSchema = new mongoose.Schema({
  name:        { type: String },
  description: { type: String },
  company:     { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
});

SectorSchema.statics = {
  getStatistics: function(sectorId) {
    let now = new Date();

    var _getIncompleteRegistersPromise = function() {
      return Register.find({ sector: sectorId })
                     //.sort({ date: -1 })
                     .where('type')
                     .equals('entry')
                     .where('isResolved')
                     .equals(false)
                     .exec();
    };
    
    var _getWeeklyRegisterDataPromise = function() {
      return Register.find({ sector: sectorId })
                     .sort({ date: -1 })
                     .where('time')
                     .gte(moment(now).subtract(8, 'days'))
                     .populate('person')
                     .exec();
    };

    return Promise.all([
      _getIncompleteRegistersPromise(),
      _getWeeklyRegisterDataPromise(),
    ])
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
        staffCount: _.filter(dataRedux, r => r.personType === 'staff').length,
        contractorCount: _.filter(dataRedux, r => r.personType === 'contractor').length,
        visitCount: _.filter(dataRedux, r => r.personType === 'visitor').length,
        weeklyHistory: _weeklyHistory
      };  
    });    
  },
//.populate('person')
  exportRegistersExcel: function(sectorId) {
    //var data = [['TIPO REGISTRO', 'RUT', 'NOMBRE', 'CATEGORIA PERSONA', 'HORA REGISTRO']];
    var data = [['RUT', 'NOMBRE', 'PERFIL', 'ENTRADA', 'COMENTARIO', 'SALIDA', 'SECTOR', 'COMENTARIO']];
        
    return Register.find()
      .where('sector').equals(sectorId)
      .where('type').equals('entry')
      .deepPopulate('person sector resolvedRegister.sector')
      .sort({_id: -1 })
      .lean()
      .exec()
      .then(function(registers) {
        for(var i in registers) {
          let rowA;
        
          if(registers[i].person === null) {
            console.log('Person can not be resolved, it is null');
            rowA = [registers[i].type, 'NA', 'NA', 'NA', registers[i].time];
          } else if(_.has(registers[i], 'resolvedRegister')) {
            rowA = [
              registers[i].person.rut, 
              registers[i].person.name, 
              registers[i].personType, 
              moment(registers[i].time).format(), 
              registers[i].comments, 
              moment(registers[i].resolvedRegister.time).format(), 
              registers[i].resolvedRegister.sector.name,
              registers[i].resolvedRegister.comments
            ];
          } else {
            rowA = [
              registers[i].person.rut, 
              registers[i].person.name, 
              registers[i].personType, 
              moment(registers[i].time).format(), 
              registers[i].comments, 
              '', 
              '', 
              ''
            ];
          }
        
          data.push(rowA);
        }
      })
      .then(function() {
        var buffer = xlsx.build([{ name: 'mySheetName', data: data }]);
        return new Promise(resolve => resolve(buffer));
      });
  }
};

SectorSchema.index({ company: 1 });

export default mongoose.model('Sector', SectorSchema);
