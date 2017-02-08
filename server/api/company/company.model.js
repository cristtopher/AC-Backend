'use strict';

import Promise from 'bluebird';

import mongoose from 'mongoose';
import moment from 'moment';
import * as _ from 'lodash';

var CompanySchema = new mongoose.Schema({
  name:        { type: String },
  logo:        { type: String },
  description: { type: String }
});

import Register from '../register/register.model';

CompanySchema.statics = {
  getStatistics: function(companyId) {
    let now = new Date();

    var _getIncompleteRegistersPromise = function() {
      return Register.find({ company: companyId })
                     .where('type')
                     .equals('entry')
                     .where('isResolved')
                     .equals(false)
                     .exec();
    };
    
    var _getWeeklyRegisterDataPromise = function() {
      return Register.find({ company: companyId })
                     .where('time').gte(moment(now).subtract(8, 'days'))
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
    
        console.log(`for ${lowerDate.toDate()} => entriesFound: ${entriesFound.length}, departsFound: ${departsFound.length}`);
    
        _weeklyHistory.entry.push({ datetime: lowerDate.unix() * 1000, count: _.size(entriesFound) });
        _weeklyHistory.depart.push({ datetime: lowerDate.unix() * 1000, count: _.size(departsFound) });
      }

      return {
        staffCount: _.filter(incompleteRegisters, r => r.personType === 'staff').length,
        contractorCount: _.filter(incompleteRegisters, r => r.personType === 'contractor').length,
        visitCount: _.filter(incompleteRegisters, r => r.personType === 'visitor').length,
        weeklyHistory: _weeklyHistory
      };  
    });    
  }
};

CompanySchema.index({ name: 1 });

export default mongoose.model('Company', CompanySchema);
