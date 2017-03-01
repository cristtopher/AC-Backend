'use strict';

import Promise from 'bluebird';

import mongoose from 'mongoose';
import moment from 'moment';
import * as _ from 'lodash';

import Register from '../register/register.model';
import Sector from '../sector/sector.model';

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
                     .where('type')
                     .equals('entry')
                     .where('isResolved')
                     .equals(false)
                     .exec();
    };
    
    var _getWeeklyRegisterDataPromise = function(sectors) {
      return Register.find({})
                     .where('sector').in(sectors)
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

      var key_list = [];
      var data_redux = [];
      for(var e in incompleteRegisters) {
        if(!_.includes(key_list, incompleteRegisters[e].person.toString())) {
          key_list.push(incompleteRegisters[e].person.toString());
          data_redux.push(incompleteRegisters[e]);
        }
      }

      return {
        staffCount: _.filter(data_redux, r => r.personType === 'staff').length,
        contractorCount: _.filter(data_redux, r => r.personType === 'contractor').length,
        visitCount: _.filter(data_redux, r => r.personType === 'visitor').length,
        weeklyHistory: _weeklyHistory
      };  
    });    
  },
  
  getRegisters: function(companyId) {
    return Sector.find({ company: companyId }).exec()
    .then(function(sectors) { 
      return Register.find()
        .populate('person sector resolvedRegister')
        .where('sector')
        .in(sectors)
        .exec();
    });
  }
};

CompanySchema.index({ name: 1 });

export default mongoose.model('Company', CompanySchema);
