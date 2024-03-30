import { Injectable } from '@angular/core';
import { Action, Selector, State } from '@ngxs/store';
import { SetRangeAction } from './metrics.actions';

const LS_RANGE = 'metrics.range';

export interface MetricsStateModel {
  range: string;
  rateInterval: string;
  address: string;
  updateInterval: number;
  start: number;
}

function getStoredRange() {
  const value = parseInt(localStorage.getItem(LS_RANGE) ?? '');
  return isNaN(value) ? -1 * 60 * 60 * 1000 : value;
}

@State<MetricsStateModel>({
  name: 'metrics',
  defaults: {
    range: '1m',
    updateInterval: 5000,
    start: getStoredRange(),
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

  @Selector()
  static range(state: MetricsStateModel) {
    return state.range;
  }

  @Action(SetRangeAction)
  setRange(ctx: any, action: SetRangeAction) {
    localStorage.setItem(LS_RANGE, '' + action.range);
    ctx.patchState({ range: action.range });
    location.reload();
  }
}
