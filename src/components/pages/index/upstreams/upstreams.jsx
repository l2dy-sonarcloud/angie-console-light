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
import IndexBox from '../indexbox/indexbox.jsx';
import AlertsCount from '../alertscount/alertscount.jsx';
import DataBinder from '../../../databinder/databinder.jsx';
import api from '../../../../api';
import mapperHttpUpstreams from '../../../../api/mappers/httpUpstreams.js';
import calculateUpstreams from '../../../../calculators/upstreams.js';
import styles from './style.css';

export class UpstreamsBox extends React.Component {
	render() {
		const { props: { title, stats, status, href } } = this;

		return (
			<IndexBox
				title={title}
				status={status}
				href={href}
			>
				<AlertsCount
					total={stats.total}
					warnings={stats.warnings}
					alerts={stats.alerts}
					href={href}
				/>

				<h4>Серверы</h4>
				<p>
					Все:
					{' '}
					{stats.servers.all}
					{' '}
					/ Работают:
					{' '}
					{stats.servers.up}
				</p>
				<p className={stats.servers.failed > 0 ? styles.red : undefined}>
					Упало:
					{' '}
					{stats.servers.failed}
				</p>
			</IndexBox>
		);
	}
}

export class Upstreams extends React.Component {
	render() {
		const { props: { data, store } } = this;
		const stats = data.upstreams.__STATS;

		return (
			<UpstreamsBox
				title="HTTP Апстримы"
				stats={stats}
				status={store.__STATUSES.upstreams.status}
				href="#upstreams"
			/>
		);
	}
}

export default DataBinder(Upstreams, [
	api.http.upstreams.setMapper(mapperHttpUpstreams).process(calculateUpstreams)
]);
