import {transformers} from './transformers';
import {conditions} from './conditions';
import {calculations} from './calculations';
import _ from 'lodash';
import angular from 'angular';

export class DimensionTableEditorCtrl {

  constructor($scope, $q, $injector, uiSegmentSrv){
    $scope.editor = this;
    
    this.$q = $q;
    this.uiSegmentSrv = uiSegmentSrv;

    this._transformers = transformers;
    this._conditions = conditions;
    this._calculations = calculations;
    this.panelCtrl= $scope.ctrl;
    this.panel = this.panelCtrl.panel;
    this.addColumnSegment = this.uiSegmentSrv.newPlusButton();

    this._columns = null;
  }

  get transformers(){
    return this._transformers;
  }

  set transformers(t){
    this._transformers = t;
  }

  get conditions(){
    return this._conditions;
  }

  set conditions(c){
    this._conditions = c;
  }

  get calculations(){
    return this._calculations;
  }

  set calculations(c){
    this._calculations = c;
  }

  getColumns() {

    if(!this._columns){
      this._columns = transformers[this.panel.transform].getColumns(this.panelCtrl.dataRaw);
    }

    return this._columns;
  }

  getCalculationColumnOptions(){
    var columns = this.getColumns();

    return columns;
  }

  getColumnOptions(){
    if (!this.panelCtrl.dataRaw){
      return this.$q.when([]);
    }

    var columns = this.getColumns();

    var segments = [];
    for(var i in columns){
      segments.push(this.uiSegmentSrv.newSegment({value: columns[i].text}));
    }

    return this.$q.when(segments);
  }

  removeDimension(column){
    this.panel.columns = _.without(this.panel.columns, column);
    this.panel.dimensions = _.without(this.panel.dimensions, column);

    this.render();
  }

  addDimension(){
    var columns = transformers[this.panel.transform].getColumns(this.panelCtrl.dataRaw);
    var column = _.find(columns, {text: this.addColumnSegment.value});
    
    if(column){
      column.type = 'dimension';
      this.panel.columns.push(column);
      this.panel.dimensions.push(column);
      this.render();
    }

    var plus = this.uiSegmentSrv.newPlusButton();
    this.addColumnSegment.html = plus.html;
    this.addColumnSegment.value = plus.value;
  }

  addCalculation(){
    var calculationDefaults = {
      type: 'count',
      title: null,
      if: {
        column: null,
        condition: null,
        value: null
      }
    };

    var calculation = angular.copy(calculationDefaults);
    var column = {text: null, value: null, type: 'calculation'};
    var _handler = {
      set: function(target, name, value){
        target[name] = value;
        
        if('title' === name){
          column.text = value;
          column.value = value;
        }

        return true;
      },

      get: function(target, name){
        return target[name];
      }
    };
   
    this.panel.columns.push(column);
    this.panel.calculations.push(new Proxy(calculation, _handler));
  }

  removeCalculation(c){
    this.panel.calculations = _.without(this.panel.calculations, c);
    
    var found = this.panel.columns.find(function(value, index){
      return value.value === c.title;
    });

    this.panel.columns = _.without(this.panel.columns, found);
    this.render();
  }

  render(){
    this.panelCtrl.render();
  }
}

export function dimensionTableEditor($q, uiSegmentSrv){
  
  return {
    restrict: 'E',
    scope: true,
    templateUrl: 'public/plugins/produbanbr-dimension-table-panel/editor.html',
    controller: DimensionTableEditorCtrl,
  };
}

