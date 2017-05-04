import {conditions} from './conditions';

var calculations = {};

calculations['count'] = {
  description: 'Count',
  reducer: function(name, calculation){
    return function(row, memo){
      memo[name] = (memo[name] || 0) + 1;
    };
  }
};

calculations['count-if'] = {
  description: 'Count if',
  reducer: function(name, calculation){
    var _if = calculation['if'];

    if(!_if){
      throw {message: 'Count if does not have condition'};
    }

    return function(row, memo){
      var _comparation = conditions[_if.condition].comparation();
      if(_comparation(row[_if.column], _if.value)){
        memo[name] = (memo[name] || 0) + 1;
      }
    }
  }
};

calculations['sum'] = {
  description: 'Sum'
};

calculations['sum-if'] = {
  description: 'Sum if'
};

export {calculations}

