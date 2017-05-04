import _ from 'lodash';
import flatten from '../../app/core/utils/flatten';
import TableModel from '../../app/core/table_model';
import angular from 'angular';

import DataFrame from './external/dataframe';

import {calculations} from './calculations';

var transformers = {};

transformers['json'] = {
  description: 'JSON Data',
  getColumns: function(data){
    if (!data || data.length === 0){
      return [];
    }

    var names = {};
    for(var i = 0; i < data.length; i++){
      var series = data[i];
      if(series.type !== 'docs'){
        continue;
      }

      //check the first 100 docs
      var maxDocs = Math.min(series.datapoints.length, 100);
      for(var y = 0; y < maxDocs; y++){
        var doc = series.datapoints[y];
        var flattened = flatten(doc, null);
        for(var propName in flattened){
          names[propName] = true;
        }
      }
    }

    var result = _.map(names, function(value, key){
      return {text: key, value: key};
    });

    result.sort(function(a, b){
      return a.value.localeCompare(b.value);
    });

    return result;
  },

  transform: function(data, panel, model){
    
    if(panel.columns.length === 0){
      model.columns.push({text: 'JSON'});
    }

    //DataFrame: dimensions
    var dimensions = [];

    //process the Dimensions, pushing all of then into the columns' model
    for(var i = 0; i < panel.columns.length; i++){
      model.columns.push(angular.copy(panel.columns[i]));

      if(panel.columns[i].type === 'dimension'){
        dimensions.push({
          value: panel.columns[i].value,
          title: panel.columns[i].text
        });
      }
    }

    //the dataframe reducers
    var reducers = [];

    //process the Calculations
    for(var i = 0; i < panel.calculations.length; i++){
      var calculation = panel.calculations[i];

      //push new function reducer into the reducers' array
      reducers.push(calculations[calculation.type].reducer(calculation.title, calculation));
    }

    //DataFrame: reduce function 
    var reduce = function(row, memo){
      for(var i = 0; i < reducers.length; i++){
        reducers[i](row, memo);
      }
    };

    //DataFrame: rows
    var rows = [];
    for(var i = 0; i < data.length; i++){
      var datapoints = data[i].datapoints;
      for(var y = 0; y < datapoints.length; y++){
        rows.push(flatten(datapoints[y]));
      }
    }

    //DataFrame: active dimensions
    var active = _.map(dimensions, 'title');

    //DataFrame
    model.dataframe = DataFrame({
      rows: rows,
      dimensions: dimensions,
      reduce: reduce
    });

    //DataFrame: calculate
    model.rows = model.dataframe.calculate({
      dimensions: active,
      sortBy: active[0],
      sortDir: 'asc'
    });

    console.log(rows);
  }
};

function transformation(data, panel){
  
  var model = new TableModel();

  if(!data || data.length === 0){
    return model;
  }

  var transformer = transformers[panel.transform];
  if(!transformer){
    throw {message: 'Transformer ' + panel.transform + ' not found'};
  }

  transformer.transform(data, panel, model);
  return model;
}

export {transformers, transformation}

