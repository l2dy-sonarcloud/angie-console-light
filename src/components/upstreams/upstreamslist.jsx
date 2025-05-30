/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
/* eslint no-alert: 0 */
import React from 'react';
import { apiUtils } from '../../api';
import envUtils from '../../env';
import SortableTable from '../table/sortabletable.jsx';
import ProgressBar from '../progressbar/progressbar.jsx';
import appsettings from '../../appsettings';
import UpstreamsEditor from './editor/upstreamseditor.jsx';
import { SharedZoneTooltip } from '../pages/tooltips.jsx';
import UpstreamStatsTooltip from './UpstreamStatsTooltip.jsx';
import UpstreamServersList from './upstreamserverslist.jsx';
import styles from './style.css';
import tableStyles from '../table/style.css';
import tooltips from '../../tooltips/index.jsx';

export const FILTER_OPTIONS = {
	all: 'Show all',
	up: 'Up',
	failed: 'Failed',
	checking: 'Checking',
	down: 'Down',
	busy: 'Busy',
};

export default class UpstreamsList extends SortableTable {
	constructor(props) {
		super(props);

		this.state = {
			...this.state,
			editMode: false,
			editor: false,
			servers: new Map(),
			selectedPeers: new Map(),
			selectedServers: new Map(),
			filtering: appsettings.getSetting(this.FILTERING_SETTINGS_KEY, 'all'),
		};

		this.toggleEditMode = this.toggleEditMode.bind(this);
		this.changeFilterRule = this.changeFilterRule.bind(this);

		this.addUpstream = this.addUpstream.bind(this);
		this.editSelectedUpstream = this.editSelectedUpstream.bind(this);
		this.showEditor = this.showEditor.bind(this);
		this.closeEditor = this.closeEditor.bind(this);
		this.selectAllServers = this.selectAllServers.bind(this);
		this.selectPeer = this.selectPeer.bind(this);
		this.getCheckboxServer = this.getCheckboxServer.bind(this);
		this.getSelectAllCheckbox = this.getSelectAllCheckbox.bind(this);
		this.getUpstreamServers = this.getUpstreamServers.bind(this);
	}

	getUpstreamServers() {
		const { t } = this.props;
		return this.props.upstreamsApi.getServers(this.props.upstream.name).then(data => {
			if (data) {
				const dict = new Map(this.props
					.upstream.peers.reduce((acc, item) => { acc.push([item.name, item.server]); return acc; }, []));
				const servers = Object.entries(data).map(([key, value]) => [[key, dict.get(key)], value]);
				const state = {
					editMode: true,
					servers: new Map(servers),
					selectedServers: new Map(),
				};

				this.setState(state);
			} else {
				this.setState({
					editMode: false,
					servers: new Map(),
					selectedServers: new Map()
				});
				alert(t('Sorry, API is read-only, please make it writable.', { ns: 'upstreams.upstreams-list' }));
			}
		});
	}

	toggleEditMode() {
		if (envUtils.isDemoEnv()) return;

		if (this.state.editMode) {
			this.setState({
				editMode: false,
				servers: new Map(),
				selectedServers: new Map()
			});
			return;
		}

		const { t } = this.props;
		if (/[^\x20-\x7F]/.test(this.props.upstream.name)) {
			alert(
				t('Sorry, upstream configuration is not available for the upstreams with non-ascii characters in their names', { ns: 'upstreams.upstreams-list' })
			);
		}

		return this.getUpstreamServers();
	}

	editSelectedUpstream(serverName, server) {
		if (server) {
			this.setState({
				selectedServers: new Map([[serverName, server]]),
			});

			this.showEditor('edit');
			return;
		}

		if (this.state.selectedServers.size > 0) {
			this.showEditor('edit');
		}
	}

	addUpstream() {
		this.showEditor('add');
	}

	closeEditor(shouldClearPeers = false) {
		const state = {
			editor: null,
		};
		if (shouldClearPeers) {
			state.selectedPeers = new Map();
		}
		this.setState(state);
	}

	showEditor(mode) {
		this.setState({
			editor: mode,
		});
	}

	changeFilterRule(evt) {
		appsettings.setSetting(this.FILTERING_SETTINGS_KEY, evt.target.value);

		this.setState({
			filtering: evt.target.value,
		});
	}

	renderEmptyList() {
		const { t } = this.props;
		return (
			<tr>
				<td className={tableStyles['left-align']} colSpan={30}>
					{t('No servers found in this upstream group', { ns: 'upstreams.upstreams-list' })}
					{' '}
					'
					{t(FILTER_OPTIONS[this.state.filtering], { ns: 'upstreams.upstreams-list' })}
					'.
				</td>
			</tr>
		);
	}

	renderServersOrPeers(peers) {
		const { editMode, servers } = this.state;

		if (!editMode) {
			return this.renderPeers(peers);
		}

		return (
			<UpstreamServersList
				servers={servers}
				editSelectedUpstream={this.editSelectedUpstream}
				renderAllSelectCheckbox={this.getSelectAllCheckbox}
				renderSelectCheckbox={this.getCheckboxServer}
			/>
		);
	}

	renderPeers() { }

	filterPeers(data, filtering = this.state.filtering) {
		return data.filter((item) => {
			let needOrder = 'all';

			if (filtering === 'all') {
				return true;
			}

			switch (item.state) {
				case 'up':
					needOrder = 'up';
					break;
				case 'unavail':
				case 'unhealthy':
				case 'busy':
					needOrder = 'failed';
					break;
				case 'checking':
					needOrder = 'checking';
					break;
				case 'down':
					needOrder = 'down';
					break;
			}

			return needOrder === filtering;
		});
	}

	selectAllServers() {
		if (this.state.servers.size === this.state.selectedServers.size) {
			this.setState({
				selectedServers: new Map()
			});
		} else {
			this.setState({
				selectedServers: new Map(
					Array.from(this.state.servers).map(([[serverName], server]) => [serverName, server])
				),
			});
		}
	}

	selectServer(serverName, server) {
		const { selectedServers } = this.state;

		if (!selectedServers.has(serverName)) {
			selectedServers.set(serverName, server);
		} else {
			selectedServers.delete(serverName);
		}
		this.setState({
			selectedServers: new Map(selectedServers),
		});
	}

	selectPeer(peer, state) {
		const { selectedPeers } = this.state;

		if (state) {
			selectedPeers.set(peer.id, peer);
		} else {
			selectedPeers.delete(peer.id);
		}

		this.setState({
			selectedPeers,
		});
	}

	getSelectAllCheckbox() {
		return this.state.editMode ? (
			<th rowSpan="2" className={tableStyles.checkbox}>
				<input
					type="checkbox"
					onChange={() => this.selectAllServers()}
					checked={this.state.selectedServers.size === this.state.servers.size}
				/>
			</th>
		) : null;
	}

	getCheckboxServer(serverName, server) {
		return this.state.editMode ? (
			<td className={tableStyles.checkbox}>
				<input
					type="checkbox"
					onChange={() => this.selectServer(serverName, server)}
					checked={this.state.selectedServers.has(serverName)}
				/>
			</td>
		) : null;
	}

	getCheckbox(peer) {
		return this.state.editMode ? (
			<td className={tableStyles.checkbox}>
				<input
					type="checkbox"
					onChange={(evt) => this.selectPeer(peer, evt.target.checked)}
					checked={this.state.selectedPeers.has(peer.id)}
				/>
			</td>
		) : null;
	}

	renderEditButton() {
		const { t } = this.props;
		if (envUtils.isDemoEnv()) {
			return (
				<span
					className={styles['edit-label']}
				>
					<span className={styles['edit-icon']} />
					<span className={styles['promo-text']}>
						{t('Available only in', { ns: 'upstreams.upstreams-list' })}
						{' '}
						<span>Angie PRO</span>
						&nbsp;
					</span>
				</span>
			);
		}

		if (!apiUtils.isAngiePro()) {
			return (
				<span
					className={
						styles['edit-disable']
					}
					{...tooltips.useTooltip(`${t('Available only in Angie PRO', { ns: 'upstreams.upstreams-list' })}`, 'hint-right')}
				/>
			);
		}

		return (
			<span
				className={
					this.state.editMode ? styles['edit-active'] : styles.edit
				}
				onClick={this.toggleEditMode}
			/>
		);
	}

	render() {
		const { t, name, upstream } = this.props;

		let peers;

		if (this.props.showOnlyFailed) {
			peers = this.filterPeers(upstream.peers, 'failed');

			if (peers.length === 0) {
				return null;
			}
		} else {
			peers = this.filterPeers(upstream.peers);
		}

		if (this.state.sortOrder === 'desc') {
			peers = peers.sort((a) => {
				if (
					a.state === 'down' ||
					a.state === 'unhealthy' ||
					a.state === 'busy' ||
					a.state === 'unavail'
				) {
					return -1;
				}

				return 1;
			});
		}

		return (
			<div className={styles['upstreams-list']} id={`upstream-${name}`}>
				{this.state.editor ? (
					<UpstreamsEditor
						upstream={upstream}
						servers={
							this.state.editor === 'edit' ? this.state.selectedServers : null
						}
						isStream={this.props.isStream}
						onClose={this.closeEditor}
						upstreamsApi={this.props.upstreamsApi}
						reloadUpstreamServers={this.getUpstreamServers}
					/>
				) : null}

				<select
					name="filter"
					className={styles.filter}
					onChange={this.changeFilterRule}
				>
					{Object.keys(FILTER_OPTIONS).map((value) => (
						<option
							value={value}
							key={value}
							selected={this.state.filtering === value}
						>
							{t(FILTER_OPTIONS[value], { ns: 'upstreams.upstreams-list' })}
						</option>
					))}
				</select>

				<div className={styles.head}>
					<h2
						className={styles.title}
						{...tooltips.useTooltip(
							<UpstreamStatsTooltip upstream={upstream} />,
						)}
					>
						{name}
					</h2>

					{this.renderEditButton()}

					{this.state.editMode
						? [
							<span
								className={styles.btn}
								key="edit"
								onClick={() => this.editSelectedUpstream()}
							>
								{t('Edit selected', { ns: 'upstreams.upstreams-list' })}
							</span>,
							<span
								className={styles.btn}
								key="add"
								onClick={this.addUpstream}
							>
								{t('Add server', { ns: 'upstreams.upstreams-list' })}
							</span>,
						]
						: null}

					{upstream.zoneSize !== null ? (
						<span className={styles['zone-capacity']}>
							{t('Zone', { ns: 'upstreams.upstreams-list' })}
							{' '}
							<span
								{...tooltips.useTooltip(
									<SharedZoneTooltip zone={upstream.slab} />,
									'hint',
								)}
							>
								<ProgressBar percentage={upstream.zoneSize} />
							</span>
						</span>
					) : null}
				</div>
				{this.renderServersOrPeers(peers)}
			</div>
		);
	}
}

UpstreamsList.defaultProps = {
	// i18n for testings
	t: key => key,
};
