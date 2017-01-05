'use strict';


import mongoose from 'mongoose';
import moment from 'moment';
import * as _ from 'lodash';

import Register from '../register/register.model';

var SectorSchema = new mongoose.Schema({
  name:        { type: String },
  description: { type: String },
  company:     { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
});

SectorSchema.statics = {
  statistics: function(sectorId) {
    let now = new Date();
    
    return Register.find({ sector: sectorId })
      .where('time').gte(moment(now).subtract(8, 'days'))
      .populate('person')
      .then(function(registers) {
        var _weeklyHistory = {
          entry: [],
          depart: []
        };
                
        for(var i = 1; i <= 7; i++) {
          let upperDate = i == 1 ? now : moment(now).startOf('day').subtract(i - 1, 'days');  
          let lowerDate = i == 1 ? moment(now).startOf('day') : moment(now).startOf('day').subtract(i, 'days');
          
          let timeFilteredRegisters = _.filter(registers, r => r.time < upperDate && r.time > lowerDate);
          
          let entriesFound = _.filter(timeFilteredRegisters, r => r.type === 'entry');
          let departsFound = _.filter(timeFilteredRegisters, r => r.type === 'depart');
      
          console.log(`entriesFound: ${entriesFound.length}, departsFound: ${departsFound.length}`);
      
          _weeklyHistory.entry.push({ datetime: moment(now).subtract(i - 1, 'days').unix() * 1000, count: _.size(entriesFound) });
          _weeklyHistory.depart.push({ datetime: moment(now).subtract(i - 1, 'days').unix() * 1000, count: _.size(departsFound) });
        }

        return {
          staffCount: _.filter(registers, r => r.person.type === 'staff').length,
          contractorCount: _.filter(registers, r => r.person.type === 'contractor').length,
          visitCount: _.filter(registers, r => r.person.type === 'visitor').length,
          weeklyHistory: _weeklyHistory
        };
      });
  }
};

SectorSchema.index({ company: 1 });

export default mongoose.model('Sector', SectorSchema);
