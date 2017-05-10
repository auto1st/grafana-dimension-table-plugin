import {MetricsPanelCtrl} from 'app/plugins/sdk';
import _ from 'lodash';

import {dimensionTableEditor} from './editor';
import {transformation} from './transformers';
import {Renderer} from './renderer';

import DataFrame from "./external/dataframe";

import $ from 'jquery';

const panelDefaults = {
  
  transform: 'json',
  columns: [],
  dimensions: [],
  calculations: [
    {
      type: 'count',
      title: null,
      if: {
        column: null,
        condition: null,
        value: null
      }
    }
  ],
  sort: {col: 0, desc: false}
};

export class DimensionTableCtrl extends MetricsPanelCtrl {

  constructor($scope, $injector) {
    super($scope, $injector);
    _.defaults(this.panel, panelDefaults);
  
    this._dataRaw = null;
    this._table = null;

    this.events.on('data-received', this.onDataReceived.bind(this));
    this.events.on('data-error', this.onDataError.bind(this));
    this.events.on('data-snapshot-load', this.onDataReceived.bind(this));
    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
  }

  get dataRaw(){
    return this._dataRaw;
  }

  set dataRaw(raw){
    this._dataRaw = raw;
  }

  get table(){
    return this._table;
  }

  set table(t){
    this._table = t;
  }

  onInitEditMode() {
    this.addEditorTab('Options', dimensionTableEditor, 2);
  }

  onDataReceived(dataList) {
    this._dataRaw = dataList;
    //Start here... Get and Save Data-Entry API locally.

    var token = null;

    //Perform login
    $.ajax({
	    method: 'POST',
	    url: 'https://dataentry-rm-dev.appls.cmpn.paas.gsnetcloud.corp/api/sign-in',
	    data: {username: "admin", password: "admin"},
      async: false,
      success: function(result){
        token = result.token;
      }
    });

    //agora as chamadas ficam independentes, pois todas serão síncronas, 
    //tendeu?
    //so de colocar aquele async false resolve? 
    //sim
    // ai as chamads subsequentes sao sincronas?
    //sim
    // pode salvar e rodar?
    //vou subir o docker para vc, blz?
    //nervous_wilson (nome do docker)
    //Produto
		var product_list = null;
		$.ajax({
			method: 'GET',
	    url: 'https://dataentry-rm-dev.appls.cmpn.paas.gsnetcloud.corp/api/entity/Produto',
	    headers: {'X-Access-Token': token},
      success: function(result){
        product_list = result;
      }
      console.log(product_list);
		});
    /** 
    $.ajax({
			method: 'POST',
	    url: 'https://dataentry-rm-dev.appls.cmpn.paas.gsnetcloud.corp/api/sign-in',
	    data: {username: "admin", password: "admin"},
		}).done(function(result){
      //todas chamadas nesse escopo
      //
      //Produto
			$.ajax({
				method: 'GET',
	    	url: 'https://dataentry-rm-dev.appls.cmpn.paas.gsnetcloud.corp/api/entity/Produto',
	    	headers: {'X-Access-Token': token},
			}).done(function(result){

				console.log(result);
			});
      **/

      //Projeto
      
      //Release

      //Sigla

      //Canal
    
		this.render();
  }

  onDataError(err){
    this._dataRaw = [];
    this.render();
  }

  toggleSort(column, columnIndex){
  
  }

  render(){
    this._table = transformation(this._dataRaw, this.panel);
    //this._table.sort
    super.render(this._table);
  }

  link(scope, elem, attrs, ctrl){

    var data;
    var ctrl = ctrl;
    var panel = ctrl.panel;
    var pageCount = 0;
   
    function renderPanel() {

      elem.css({'font-size': panel.fontSize});
      elem.parents('.panel').addClass('table-panel-wrapper');
  
      var renderer = new Renderer(panel, data, ctrl.dashboard.isTimezoneUtc(), ctrl.$sanitize);
      var html = renderer.render(0);

      var tbody = elem.find('tbody');
      tbody.empty();
      tbody.html(html);

      var rootele = elem.find('.table-panel-scroll');
      rootele.css({'max-height': ctrl.height});

    }

    ctrl.events.on('render', function(renderData){
      data = renderData || data;
            
      if(data){
        renderPanel();
      }

      ctrl.renderingCompleted();
    });
  }
}

DimensionTableCtrl.templateUrl = 'module.html';

