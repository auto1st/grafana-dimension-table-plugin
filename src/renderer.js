import './css/styles.css!';

export class Renderer {
  constructor(panel, model, isTimezoneUtc, sanitize){
    this._panel = panel;
    this._model = model;
    this._sanitize = sanitize;
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

  valueOf(column, row){
   
    var property = column.value;

    if(column.type && column.type === 'dimension'){
      property = column.text;
    }

    var result = '';

    if(row[property]){
      result = row[property];
    }

    if(result !== '' 
       && column.type 
       && column.type === 'calculation'){
      result = '<div class="badge badge-pill badge-info" style="width: 100%; text-align: center;">' + result + '</div>';
    }

    return result;
  }

  render(pageno){
    var result = "";
  
    var rows = this.model.rows;
    var columns = this.model.columns;

    console.log(columns);
    
    for(var i = 0; i < rows.length; i++){
      var row = rows[i];

      result += '<tr>';
      for(var y = 0; y < columns.length; y++){
        var column = columns[y];

        if(y < row._level){
          result += '<td style="border-spacing: 0; border: none; background: none;">';
          if(i === 0){
            result += '<div class="table-panel-width-hack">';
            result += column.text;
            result += '</div>';
          }
          result += '</td>';
        } else {
          result += '<td style="border-spacing: 0; border-top: 1px solid rgba(0,0,0,.5); border-bottom: none; border-right: none;">';
          if(i === 0){
            result += '<div class="table-panel-width-hack">';
            result += column.text;
            result += '</div>';
          }
          result += this.valueOf(column, row);
          result += '</td>';
        }
      }

      result += '</tr>'
    }

    return result;
  }
}
