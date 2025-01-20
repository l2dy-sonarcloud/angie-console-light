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
import DataBinder from '../databinder/databinder.jsx';
import api from '../../api';

import Settings from '../settings/index.jsx';

import Icon from '../icon/icon.jsx';
import mapperHttpResponse from '../../api/mappers/httpResponse.js';
import mapperHttpUpstreams from '../../api/mappers/httpUpstreams.js';
import mapperResolvers from '../../api/mappers/resolvers.js';
import mapperStreamServerZones from '../../api/mappers/streamServerZones.js';
import calculateServerZones from '../../calculators/serverzones.js';
import calculateLocationZones from '../../calculators/locationzones.js';
import calculateUpstreams from '../../calculators/upstreams.js';
import { zones as calculateStreamZones } from '../../calculators/stream.js';
import calculateCaches from '../../calculators/caches.js';
import calculateSharedZones from '../../calculators/sharedzones.js';
import calculateResolvers from '../../calculators/resolvers.js';

import styles from './style.css';

export const SECTIONS = [
	{
		title: 'HTTP Zones',
		hash: '#server_zones',
		statusKey: 'server_zones'
	},
	{
		title: 'HTTP Upstreams',
		hash: '#upstreams',
		statusKey: 'upstreams'
	},
	{
		title: 'TCP/UDP Zones',
		hash: '#tcp_zones',
		statusKey: 'tcp_zones'
	},
	{
		title: 'TCP/UDP Upstreams',
		hash: '#tcp_upstreams',
		statusKey: 'tcp_upstreams'
	},
	{
		title: 'Caches',
		hash: '#caches',
		statusKey: 'caches'
	},
	{
		title: 'Shared Zones',
		hash: '#shared_zones',
		statusKey: 'shared_zones'
	},
	{
		title: 'Resolvers',
		hash: '#resolvers',
		statusKey: 'resolvers'
	},
	{
		title: 'Config Files',
		hash: '#config_files',
		hidden: true,
	}
];

export class Navigation extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			settings: false
		};

		this.openSettings = this.openSettings.bind(this);
		this.closeSettings = this.closeSettings.bind(this);
	}

	openSettings() {
		if (this.state.settings) {
			this.closeSettings();
			return;
		}

		this.setState({
			settings: true
		});
	}

	closeSettings() {
		this.setState({
			settings: false
		});
	}

	render() {
		const { statuses, t } = this.props;
		const tabs = SECTIONS
			.filter(({ hidden }) => typeof hidden !== 'boolean' || hidden === false)
			.filter(({ statusKey }) => {
				if (statusKey === 'server_zones') {
					return (
						statuses.server_zones.ready ||
						statuses.location_zones.ready
					);
				}
				return statuses[statusKey] && statuses[statusKey].ready;
			})
			.map(section => {
				let status = '';
				let statusIcon = null;

				if ('status' in statuses[section.statusKey]) {
					status = statuses[section.statusKey].status;

					if (
						section.statusKey === 'server_zones' &&
						'status' in statuses.location_zones
					) {
						const _statuses = [status, statuses.location_zones.status];

						if (_statuses.includes('danger')) {
							status = 'danger';
						} else if (_statuses.includes('warning')) {
							status = 'warning';
						}
					}

					statusIcon = (
						<Icon className={styles.status} type={status} />
					);
				}

				return (
					<a
						className={this.props.hash === section.hash ? styles.navlinkactive : styles.navlink}
						href={section.hash}
						title={section.title}
					>
						{statusIcon}

						<span className={styles.anchor}>{t(section.title)}</span>
					</a>
				);
			});

		return (
			<div className={`${styles.nav} ${tabs.length > 6 ? styles['nav-wide'] : styles['nav-small']}`}>
				<div className={styles['nav-flex']}>
					{tabs}
				</div>

				<span className={styles.settings} onClick={this.openSettings}>
					<Icon type="gear" />
				</span>

				{
					this.state.settings ? (
						<Settings
							statuses={statuses}
							close={this.closeSettings}
						/>
					)
						: null
				}
			</div>
		);
	}
}

export default DataBinder(withNamespaces('navigation')(Navigation), [
	api.http.server_zones.setMapper(mapperHttpResponse).process(calculateServerZones),
	api.http.location_zones.setMapper(mapperHttpResponse).process(calculateLocationZones),
	api.stream.server_zones.setMapper(mapperStreamServerZones).process(calculateStreamZones),
	api.slabs.process(calculateSharedZones),
	api.http.caches.process(calculateCaches),
	api.http.upstreams.setMapper(mapperHttpUpstreams).process(calculateUpstreams),
	api.resolvers.setMapper(mapperResolvers).process(calculateResolvers),
], {
	ignoreEmpty: true
});
