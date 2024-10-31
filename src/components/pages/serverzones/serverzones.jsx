/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
import React from 'react';

import utils from '#/utils.js';
import tooltips from '#/tooltips/index.jsx';
import {
	SortableTable,
	TableSortControl,
	tableUtils,
	styles,
} from '#/components/table';

export default class StreamZones extends SortableTable {
	get SORTING_SETTINGS_KEY() {
		return 'streamZonesSortOrder';
	}

	render() {
		const { data } = this.props;
		let component = null;

		if (data) {
			const zones = Array.from(data);

			if (this.state.sortOrder === 'desc') {
				zones.sort(([nameA], [nameB]) =>
					nameA < nameB ? -1 : 1
				);
			}

			component = (
				<div>
					<h1>Сервер зоны</h1>

					<table className={`${styles.table} ${styles.wide}`}>
						<thead>
							<tr>
								<TableSortControl
									firstSortLabel="Sort by zone - asc"
									secondSortLabel="Sort by conf order"
									order={this.state.sortOrder}
									onChange={this.changeSorting}
								/>
								<th>Зоны</th>
								<th colSpan="3">Запросы</th>
								<th colSpan="6">Ответы</th>
								<th colSpan="4">Трафик</th>
								<th colSpan="4">SSL</th>
							</tr>
							<tr className={`${styles['right-align']} ${styles['sub-header']}`}>
								<th className={styles.bdr} />
								<th>Текущие</th>
								<th>Всего</th>
								<th className={styles.bdr}>Зпр./сек</th>
								<th>1xx</th>
								<th>2xx</th>
								<th>3xx</th>
								<th>4xx</th>
								<th>5xx</th>
								<th className={styles.bdr}>Всего</th>
								<th>Отп./сек</th>
								<th>Плч./сек</th>
								<th>Отправлено</th>
								<th className={styles.bdr}>Получено</th>
								<th>Рукопожатий</th>
								<th>Переиспользовано</th>
								<th>Истекло</th>
								<th>Упавших</th>
							</tr>
						</thead>
						<tbody className={styles['right-align']}>
							{
								zones.map(([name, zone]) => {
									let status = styles.ok;

									if (zone.warning) {
										status = styles.warning;
									} else if (zone['5xxChanged']) {
										status = styles.alert;
									}

									const {
										responses: { codes },
										ssl,
									} = zone;

									return (
										<tr>
											<td className={status} />
											<td className={`${styles['left-align']} ${styles.bold} ${styles.bdr}`}>{name}</td>
											<td>{zone.processing}</td>
											<td>{zone.requests}</td>
											<td className={styles.bdr}>{zone.zone_req_s}</td>
											<td>{tableUtils.responsesTextWithTooltip(zone.responses['1xx'], codes, '1')}</td>
											<td>{tableUtils.responsesTextWithTooltip(zone.responses['2xx'], codes, '2')}</td>
											<td>{tableUtils.responsesTextWithTooltip(zone.responses['3xx'], codes, '3')}</td>
											<td className={`${styles.flash}${zone['4xxChanged'] ? (` ${styles['red-flash']}`) : ''}`}>
												{
													tableUtils.responsesTextWithTooltip(
														zone.responses['4xx'] + zone.discarded,
														{
															...(codes || {
																'4xx': zone.responses['4xx']
															}),
															'499/444/408': zone.discarded,
														},
														'4'
													)
												}
											</td>
											<td className={`${styles.flash}${zone['5xxChanged'] ? (` ${styles['red-flash']}`) : ''}`}>
												{tableUtils.responsesTextWithTooltip(zone.responses['5xx'], codes, '5')}
											</td>
											<td className={styles.bdr}>{zone.responses.total}</td>
											<td className={styles.px60}>{utils.formatReadableBytes(zone.sent_s)}</td>
											<td className={styles.px60}>{utils.formatReadableBytes(zone.rcvd_s)}</td>
											<td className={styles.px60}>{utils.formatReadableBytes(zone.data.sent)}</td>
											<td className={`${styles.px60} ${styles.bdr}`}>{utils.formatReadableBytes(zone.data.received)}</td>
											<td>{ssl ? ssl.handshaked : '–'}</td>
											<td>{ssl ? ssl.reuses : '–'}</td>
											<td>{ssl ? ssl.timedout : '–'}</td>
											<td>{ssl ? ssl.failed : '–'}</td>
										</tr>
									);
								})
							}
						</tbody>
					</table>
				</div>
			);
		}

		return component;
	}
}
