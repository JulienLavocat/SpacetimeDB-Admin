import { Injectable } from '@angular/core';
import { Selector, State } from '@ngxs/store';
import { ChartConfiguration } from 'chart.js';

export interface MetricsStateModel {
  range: string;
  rateInterval: string;
  address: string;
  updateInterval: number;
  start: number;
}

@State<MetricsStateModel>({
  name: 'metrics',
  defaults: {
    range: '1m',
    updateInterval: 5000,
    start: -1 * 3600 * 1000,
    rateInterval: '1m',
    address: '',
  },
})
@Injectable()
export class MetricsState {
  @Selector()
  static params(state: MetricsStateModel) {
    return {
      range: state.range,
      rateInterval: state.rateInterval,
      start: state.start,
      updateInterval: state.updateInterval,
    };
  }
}
