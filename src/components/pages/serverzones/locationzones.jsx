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
import { withNamespaces } from 'react-i18next';

import utils from '#/utils.js';
import tooltips from '#/tooltips/index.jsx';
import {
	SortableTable,
	TableSortControl,
	tableUtils,
	styles,
} from '#/components/table';

class LocationZones extends SortableTable {
	get SORTING_SETTINGS_KEY() {
		return 'locationsSortOrder';
	}

	formatReadableBytes(value) {
		const { t } = this.props;
		return utils.formatReadableBytes(value, undefined, utils.translateReadableBytesUnits({ t }));
	}

	render() {
		const { t, data } = this.props;
		let component = null;

		if (data) {
			const locations = Array.from(data);

			if (this.state.sortOrder === 'desc') {
				locations.sort(([nameA], [nameB]) =>
					nameA < nameB ? -1 : 1
				);
			}

			component = (
				<div>
					<h1>{t('Location Zones')}</h1>

					<table className={`${styles.table} ${styles.wide}`}>
						<thead>
							<tr>
								<TableSortControl
									firstSortLabel={t('Sort by zone - asc')}
									secondSortLabel={t('Sort by conf order')}
									order={this.state.sortOrder}
									onChange={this.changeSorting}
								/>
								<th>{t('Zone')}</th>
								<th colSpan="2">{t('Requests')}</th>
								<th colSpan="6">{t('Responses')}</th>
								<th colSpan="4">{t('Traffic')}</th>
							</tr>
							<tr className={`${styles['right-align']} ${styles['sub-header']}`}>
								<th className={styles.bdr} />
								<th>{t('Total')}</th>
								<th className={styles.bdr}>{t('Req/s')}</th>
								<th>1xx</th>
								<th>2xx</th>
								<th>3xx</th>
								<th>4xx</th>
								<th>5xx</th>
								<th className={styles.bdr}>{t('Total')}</th>
								<th>{t('Sent/s')}</th>
								<th>{t('Rcvd/s')}</th>
								<th>{t('Sent')}</th>
								<th>{t('Rcvd')}</th>
							</tr>
						</thead>
						<tbody className={styles['right-align']}>
							{
								locations.map(([name, location]) => {
									let status = styles.ok;

									if (location.warning) {
										status = styles.warning;
									} else if (location['5xxChanged']) {
										status = styles.alert;
									}

									const { codes } = location.responses;

									return (
										<tr>
											<td className={status} />
											<td className={`${styles['left-align']} ${styles.bold} ${styles.bdr}`}>{name}</td>
											<td>{location.requests}</td>
											<td className={styles.bdr}>{location.zone_req_s}</td>
											<td>{tableUtils.responsesTextWithTooltip(location.responses['1xx'], codes, '1')}</td>
											<td>{tableUtils.responsesTextWithTooltip(location.responses['2xx'], codes, '2')}</td>
											<td>{tableUtils.responsesTextWithTooltip(location.responses['3xx'], codes, '3')}</td>
											<td className={`${styles.flash}${location['4xxChanged'] ? (` ${styles['red-flash']}`) : ''}`}>
												{
													tableUtils.responsesTextWithTooltip(
														location.responses['4xx'] + location.discarded,
														{
															...(codes || {
																'4xx': location.responses['4xx']
															}),
															'499/444/408': location.discarded,
														},
														'4'
													)
												}
											</td>
											<td className={`${styles.flash}${location['5xxChanged'] ? (` ${styles['red-flash']}`) : ''}`}>
												{tableUtils.responsesTextWithTooltip(location.responses['5xx'], codes, '5')}
											</td>
											<td className={styles.bdr}>{location.responses.total}</td>
											<td className={styles.px60}>{this.formatReadableBytes(location.sent_s)}</td>
											<td className={styles.px60}>{this.formatReadableBytes(location.rcvd_s)}</td>
											<td className={styles.px60}>{this.formatReadableBytes(location.data.sent)}</td>
											<td className={styles.px60}>{this.formatReadableBytes(location.data.received)}</td>
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

export default withNamespaces('pages.serverzones.locationzones')(LocationZones);
