import kbn from 'app/core/utils/kbn';

import './css/styles.css!';

export class Renderer {
  constructor(panel, model, sanitize, dashboard){
    this._panel = panel;
    this._model = model;
    this._sanitize = sanitize;
    this._dashboard = dashboard;

    this._formatters = [];

  }

  get panel() {
    return this._panel;
  }

  set panel(p){
    this._panel = p;
  }

  get model(){
    return this._model;
  }

  set model(m){
    this._model = m;
  }

  get dashboard(){
    return this._dashboard;
  }

  set dashboard(d){
    this._dashboard = d;
  }

  newTemplate(template){
    
    if('link' === template.type){
      var metadata = template.metadata;
      var timerange = this.dashboard.time;

      return function(value, row){
        var _query = '?from=' + timerange.from + '&to=' + timerange.to;

        for(var i = 0; i < metadata.queries.length; i++){
          _query += '&' + metadata.queries[i].field + '=';

          if('literal' === metadata.queries[i].value.source){
            _query += metadata.queries[i].value.get;

          } else if('column' === metadata.queries[i].value.source) {
            if(row[metadata.queries[i].value.get]){
              _query += row[metadata.queries[i].value.get];
            } else {
              _query += '';
            }

          } else {
            throw {message: 'Unknown source type ' + metadata.queries[i].value.source};
          }
        }

        var _value = '<a href="' + metadata.link + _query  + '">' + value + '</a>';
        return '<span>' + _value + '</span>';
      };

    } else {
      throw {message: 'Unknown template type ' + template.type};
    }
  }

  templateOf(property, value, row, index){
    if(this._formatters[index]){
      return this._formatters[index](value, row);
    }

    for(var i = 0; i < this.panel.templates.length; i++){
      var template = this.panel.templates[i];
      var regex = kbn.stringToJsRegex(template.selector);

      if(property.match(regex)){
        var _processor = this.newTemplate(template);
        this._formatters[index] = _processor;

        return _processor(value, row);
      }
    }

  }

  valueOf(column, row, index){
   
    var property = column.value;

    if(column.type && column.type === 'dimension'){
      property = column.text;
    }

    var result = '';

    if(row[property]){
      result = row[property];
    }

    if(result 
       && result !== ''){
      var _result = this.templateOf(property, result, row, index);
      if(_result){
        result = _result;
      }
    }

    if(result !== '' 
       && column.type 
       && column.type === 'calculation'){
      //temporary css class
      result = '<div class="badge badge-pill badge-info" style="width: 100%; text-align: center;">' + result + '</div>';
    }

    return result;
  }

  render(pageno){
    var result = "";
  
    var rows = this.model.rows;
    var columns = this.model.columns;

    for(var i = 0; i < rows.length; i++){
      var row = rows[i];

      result += '<tr>';
      for(var y = 0; y < columns.length; y++){
        var column = columns[y];

        var styles  = '';
        var inner   = '';
        var classes = '';
        if(y < row._level){
          styles = 'border-spacing: 0; border: none; background: none;';
          if(i === 0){
            inner  = '<div class="table-panel-width-hack">';
            inner += column.text;
            inner += '</div>';
          }
        } else {
          styles = 'border-spacing: 0; border-top: 1px solid rgba(0,0,0,.5); border-bottom: none; border-right: none;';
          if(i === 0){
            inner += '<div class="table-panel-width-hack">';
            inner += column.text;
            inner += '</div>';
          }
          inner += this.valueOf(column, row, y);
        }

        //first dimension row
        if(0 === row._level){
          classes += 'dt-first-dimension-row';
        }

        result += '<td' + (styles !== '' ? ' style="' + styles + '"' : '') + (classes !== '' ? ' class="' + classes + '"' : '') + '>' + inner + '</td>';
      }

      result += '</tr>'
    }

    return result;
  }
}
