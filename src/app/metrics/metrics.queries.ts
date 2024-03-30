export const TOTAL_TRANSACTIONS = `sum by (db) (increase(spacetime_num_txns_cumulative{txn_type=~"(Internal|Reducer|Sql|Subscribe|Update)", db=~"$__database"}[$__range]))`;
export const TOTAL_TX_PER_SECOND =
  'sum by (db, reducer) (rate(spacetime_num_txns_cumulative{txn_type="Reducer", db=~"$__database"}[$__rate_interval]))';
export const TOTAL_TX_DURATION =
  'sum by (db, txn_type) (rate(spacetime_txn_elapsed_time_sec_sum{db=~"$__database"}[$__rate_interval]))';
export const TOTAL_TX_CPU_TIME =
  'sum by (db, txn_type) (rate(spacetime_txn_cpu_time_sec_sum{db=~"$__database"}[$__rate_interval]))';
export const AVG_TX_DURATION =
  'sum by (db, txn_type) (rate(spacetime_txn_elapsed_time_sec_sum{txn_type=~"(Internal|Reducer|Sql|Subscribe|Update)",db=~"$__database"}[$__rate_interval])) / sum by (db, txn_type) (rate(spacetime_txn_elapsed_time_sec_count{txn_type=~"(Internal|Reducer|Sql|Subscribe|Update)",db=~"$__database"}[$__rate_interval]))';
export const AVG_TX_CPU_TIME =
  'sum by (db, txn_type) (rate(spacetime_txn_cpu_time_sec_sum{txn_type=~"(Internal|Reducer|Sql|Subscribe|Update)",db=~"$__database"}[$__rate_interval])) / sum by (db, txn_type) (rate(spacetime_txn_cpu_time_sec_count{txn_type=~"(Internal|Reducer|Sql|Subscribe|Update)",db=~"$__database"}[$__rate_interval]))';
export const COMMITS_PER_SECOND =
  'sum by (db) (rate(spacetime_num_txns_cumulative{txn_type=~"(Internal|Reducer|Sql|Subscribe|Update)", db=~"$__database", committed="true"}[$__rate_interval]))';
export const ROLLBACKS_PER_SECOND =
  'sum by (db) (rate(spacetime_num_txns_cumulative{txn_type=~"(Internal|Reducer|Sql|Subscribe|Update)", db=~"$__database", committed="false"}[$__rate_interval]))';
export const TX_DURATION_P99 =
  'histogram_quantile(0.99, sum by (db, txn_type, le) (rate(spacetime_txn_elapsed_time_sec_bucket{txn_type=~"(Internal|Reducer|Sql|Subscribe|Update)",db=~"$__database"}[$__rate_interval])))';
export const TX_DURATION_P90 =
  'histogram_quantile(0.90, sum by (db, txn_type, le) (rate(spacetime_txn_elapsed_time_sec_bucket{txn_type=~"(Internal|Reducer|Sql|Subscribe|Update)",db=~"$__database"}[$__rate_interval])))';
export const TX_CPU_TIME_P99 =
  'histogram_quantile(0.99, sum by (db, txn_type, le) (rate(spacetime_txn_cpu_time_sec_bucket{txn_type=~"(Internal|Reducer|Sql|Subscribe|Update)",db=~"$__database"}[$__rate_interval])))';
export const TX_CPU_TIME_P90 =
  'histogram_quantile(0.90, sum by (db, txn_type, le) (rate(spacetime_txn_cpu_time_sec_bucket{txn_type=~"(Internal|Reducer|Sql|Subscribe|Update)",db=~"$__database"}[$__rate_interval])))';
export const TX_CPU_TIME_MAX =
  'max by (txn_type, db) (spacetime_txn_cpu_time_sec_max{txn_type=~"(Internal|Reducer|Sql|Subscribe|Update)",db=~"$__database"})';
