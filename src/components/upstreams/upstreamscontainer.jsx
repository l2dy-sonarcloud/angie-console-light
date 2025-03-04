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
import styles from './style.css';

export const UPSTREAM_GROUP_LENGTH = 70;

class UpstreamsContainer extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			showOnlyFailed: false,
			showUpstreamsList: false,
			editor: false
		};

		this.toggleFailed = this.toggleFailed.bind(this);
		this.toggleUpstreamsList = this.toggleUpstreamsList.bind(this);
		this.handleLastItemShowing = this.handleLastItemShowing.bind(this);

		if (this.initIntersectionObserver() === false) {
			this.state.howManyToShow = Infinity;
		} else {
			this.state.howManyToShow = UPSTREAM_GROUP_LENGTH;
		}
	}

	toggleFailed() {
		this.setState({
			showOnlyFailed: !this.state.showOnlyFailed
		});
	}

	toggleUpstreamsList() {
		this.setState({
			showUpstreamsList: !this.state.showUpstreamsList
		});
	}

	initIntersectionObserver() {
		if ('IntersectionObserver' in window) {
			this.intersectionObserver = new IntersectionObserver(this.handleLastItemShowing, {
				root: null,
				threshold: 0.3
			});

			return true;
		}

		return false;
	}

	handleLastItemShowing([entry]) {
		if (
			entry.isIntersecting &&
			isFinite(this.state.howManyToShow) &&
			this.state.howManyToShow < this.props.upstreams.size
		) {
			this.intersectionObserver.unobserve(entry.target);

			this.setState({
				howManyToShow: this.state.howManyToShow + UPSTREAM_GROUP_LENGTH
			});
		}
	}

	scrollTo(upstreamName, position) {
		this.setState({
			howManyToShow: position + UPSTREAM_GROUP_LENGTH
		}, () => {
			document.getElementById(`upstream-${upstreamName}`).scrollIntoView();
		});
	}

	upstreamRef(isLast, ref) {
		if (isLast && this.intersectionObserver && ref) {
			this.intersectionObserver.observe(ref.base);
		}
	}

	render() {
		let children = [];
		let { upstreams, t } = this.props;
		const { __STATS } = upstreams;

		upstreams = Array.from(upstreams);

		let upstreamsToShow = upstreams;

		if (isFinite(this.state.howManyToShow)) {
			upstreamsToShow = upstreams.slice(0, this.state.howManyToShow);
		}

		upstreamsToShow.forEach(([name, upstream], i) => {
			if (this.state.showOnlyFailed && upstream.hasFailedPeer || !this.state.showOnlyFailed) {
				children.push(<this.props.component
					upstream={upstream}
					name={name}
					key={name}
					showOnlyFailed={this.state.showOnlyFailed}
					writePermission={this.props.writePermission}
					upstreamsApi={this.props.upstreamsApi}
					isStream={this.props.isStream}
					ref={this.upstreamRef.bind(this, i == upstreamsToShow.length - 1)}
				/>);
			}
		});

		if (children.length === 0) {
			children = (
				<div className={styles.msg}>
					{t('All upstream servers appear to be just fine — nothing to show here. Toggle \"Failed only\" to show all upstreams.')}
				</div>
			);
		}

		return (
			<div className={styles['upstreams-container']}>
				<span className={styles['toggle-failed']}>
					{t('Failed only')}
					<span
						className={this.state.showOnlyFailed ? styles['toggler-active'] : styles.toggler}
						onClick={this.toggleFailed}
					>
						<span className={styles['toggler-point']} />
					</span>
				</span>

				<h1>{this.props.title}</h1>

				<span
					className={this.state.showUpstreamsList ? styles['list-toggler-opened'] : styles['list-toggler']}
					onClick={this.toggleUpstreamsList}
				>
					{this.state.showUpstreamsList ? t('Hide') : t('Show')}
					{' '}
					{t('upstreams list')}
				</span>

				{
					this.state.showUpstreamsList ? (
						<div className={styles['upstreams-catalog']}>
							<div className={styles['upstreams-summary']}>
								<strong>
									{t('Total')}
									:
								</strong>
								{' '}
								{__STATS.total}
								{' '}
								(
								{t('upstreams')}
								:
								{' '}
								{__STATS.servers.all}
								)

								<span className={styles['red-text']}>
									<strong>{t('With problems:')}</strong>
									{' '}
									{__STATS.failures.toString()}
									{' '}
									(
									{t('upstreams')}
									:
									{' '}
									{__STATS.servers.failed}
									{' '}
									)
								</span>
							</div>

							<div className={styles['upstreams-navlinks']}>
								{
									upstreams.map(([name, upstream], i) => {
										if (this.state.showOnlyFailed && upstream.hasFailedPeer || !this.state.showOnlyFailed) {
											return (
												<span
													onClick={() => this.scrollTo(name, i)}
													className={upstream.hasFailedPeer ? styles['upstream-link-failed'] : styles['upstream-link']}
													key={name}
												>
													<span className={styles.dashed}>{name}</span>
												</span>
											);
										}
									})
								}
							</div>
						</div>
					)
						: null
				}

				{children}
			</div>
		);
	}
}

export default withNamespaces('upstreams.upstreams-container')(UpstreamsContainer);
