import {createTimeSeriesChart} from './chart.js';
import {demoData} from './data.js';
import './demo.css';
const chart=createTimeSeriesChart(document.querySelector('#chart'),demoData,{series:{area:{domain:[0,75]},spline:{domain:[0,750]},line:{domain:[0,126]},bar:{domain:[0,100]}}});
window.demoChart=chart;
