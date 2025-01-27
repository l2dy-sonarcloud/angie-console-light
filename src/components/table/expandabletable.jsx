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
import tooltips from '#/tooltips/index.jsx';
import styles from './style.css';

export default class ExpandableTable extends React.Component {
	constructor() {
		super();
		this.state = {
			expandingItems: [],
		};
		this.toogleExpandingItemState = this.toogleExpandingItemState.bind(this);
		this.handleClickExpandingAll = this.handleClickExpandingAll.bind(this);
		this.renderExpandingItemToogleIcon = this.renderExpandingItemToogleIcon.bind(this);
		this.isExpandingAll = this.isExpandingAll.bind(this);
		this.isExpandingItem = this.isExpandingItem.bind(this);
		this.getExpandableItems = this.getExpandableItems.bind(this);
		this.hasExpandable = this.hasExpandable.bind(this);
	}

	handleClickExpandingAll() {
		if (this.state.expandingItems.length) {
			this.setState({ expandingItems: [] });
			return;
		}

		this.setState({ expandingItems: this.getExpandableItems() });
	}

	toogleExpandingItemState(item) {
		if (!this.hasExpandable(item)) return;
		if (this.isExpandingItem(item)) {
			this.setState({ expandingItems: this.state.expandingItems.filter(_item => _item !== item) });
		} else {
			this.setState({ expandingItems: this.state.expandingItems.concat(item) });
		}
	}

	isExpandingAll() {
		return this.getExpandableItems().every((item) => this.state.expandingItems.indexOf(item) !== -1);
	}

	isExpandingItem(item) {
		return this.state.expandingItems.indexOf(item) !== -1;
	}

	renderExpandingItemToogleIcon(item) {
		if (!this.hasExpandable(item)) {
			if (this.getExpandableItems().length) {
				return <td className={styles['without-padding']} />;
			}
			return null;
		}
		return <td className={styles['expanding-item-control']}>{this.isExpandingItem(item) ? '▴' : '▾'}</td>;
	}

	renderExpandingAllControl(props = {}) {
		if (!this.getExpandableItems().length) return null;
		const { t } = this.props;
		return (
			<th
				{...props}
				onClick={this.handleClickExpandingAll}
				className={`${styles.sorter} ${styles.sorterActive} ${styles['hovered-expander']}`}
				{...tooltips.useTooltip(t('Show all exists shards'), 'hint-right')}
			>
				{this.isExpandingAll() ? '▴' : '▾'}
			</th>
		);
	}

	getExpandableItems() { return []; }

	hasExpandable() { }

	render() { return <div />; }
}

ExpandableTable.defaultProps = {
	// i18n for testing component
	t: (key) => key,
};
