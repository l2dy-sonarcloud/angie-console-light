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
import { shallow } from 'enzyme';
import { Caches } from '../index.jsx';
import tooltips from '../../../../tooltips/index.jsx';
import styles from '../../../table/style.css';
import HumanReadableBytes from '#/components/human-readable-bytes/human-readable-bytes';

describe('<Caches Page />', () => {
	describe('render()', () => {
		it('tooltips', () => {
			jest.spyOn(tooltips, 'useTooltip').mockClear().mockImplementation(() => ({
				passed_by_useTooltip: true
			}));

			const wrapper = shallow(
				<Caches data={{ caches: new Map() }} />
			);
			let hintedEl;

			expect(tooltips.useTooltip).toHaveBeenCalledTimes(6);
			// useTooltip call 1, arg 1
			expect(tooltips.useTooltip.mock.calls[0][0].type.displayName).toBe('CacheStateTooltip');
			// useTooltip call 1, arg 2
			expect(tooltips.useTooltip.mock.calls[0][1]).toBe('hint');

			hintedEl = wrapper.find(`thead span.${styles.hinted}`).at(0);

			// first hinted el prop
			expect(hintedEl.text()).toBe('State');
			// first hinted el prop
			expect(hintedEl.prop('passed_by_useTooltip')).toBe(true);

			// useTooltip call 2, arg 1
			expect(tooltips.useTooltip.mock.calls[1][0]).toBe('Memory usage = Used memory pages / Total memory pages');
			// useTooltip call 2, arg 2
			expect(tooltips.useTooltip.mock.calls[1][1]).toBe('hint');

			hintedEl = wrapper.find(`thead span.${styles.hinted}`).at(1);

			// first hinted el prop
			expect(hintedEl.text()).toBe('Memory usage');
			// first hinted el prop
			expect(hintedEl.prop('passed_by_useTooltip')).toBe(true);

			// useTooltip call 3, arg 1
			expect(tooltips.useTooltip.mock.calls[2][0]).toBe('Disk usage = Used / Max size');
			// useTooltip call 3, arg 2
			expect(tooltips.useTooltip.mock.calls[2][1]).toBe('hint');

			hintedEl = wrapper.find(`thead span.${styles.hinted}`).at(2);

			// first hinted el prop
			expect(hintedEl.text()).toBe('Disk usage');
			// first hinted el prop
			expect(hintedEl.prop('passed_by_useTooltip')).toBe(true);

			// caches rows
			expect(wrapper.find('tbody tr')).toHaveLength(0);

			tooltips.useTooltip.mockRestore();
			wrapper.unmount();
		});

		it('caches rows', () => {
			jest.spyOn(tooltips, 'useTooltip').mockClear().mockImplementation((prop_1, prop_2) => ({
				useTooltip_prop_1: prop_1,
				useTooltip_prop_2: prop_2
			}));

			const items = [
				['test_1', {
					cold: false,
					slab: 'test_slab_1',
					zoneSize: 30,
					max_size: 500,
					size: 430,
					warning: false,
					danger: false,
					used: 100,
					traffic: {
						s_served: 3,
						s_written: 2,
						s_bypassed: 1
					},
					hit_percents_generic: 10
				}], ['test_2', {
					cold: true,
					slab: 'test_slab_2',
					zoneSize: undefined,
					max_size: '501',
					size: 431,
					warning: true,
					danger: true,
					used: 101,
					traffic: {
						s_served: 4,
						s_written: 3,
						s_bypassed: 2
					},
					hit_percents_generic: 11
				}]
			];

			const wrapper = shallow(
				<Caches data={{
					caches: new Map(items)
				}}
				/>
			);
			const rows = wrapper.find('tbody tr');
			let cells = rows.at(0).find('td');
			let hintedEl;

			// row 1, cell 1, className
			expect(cells.at(0).prop('className')).toBe(`${styles.bold} ${styles.bdr}`);
			// row 1, cell 1, text
			expect(cells.at(0).text()).toBe('test_1');
			// row 1, cell 2, className
			expect(cells.at(1).prop('className')).toBe(`${styles.bdr} ${styles['center-align']}`);
			hintedEl = cells.at(1).find('span');
			// row 1, cell 2, useTooltip arg 1
			expect(hintedEl.prop('useTooltip_prop_1')).toBe('Warm');
			// row 1, cell 2, useTooltip arg 2
			expect(hintedEl.prop('useTooltip_prop_2')).toBe('hint');
			// row 1, cell 2, Icon
			expect(hintedEl.childAt(0).name()).toBe('Icon');
			// row 1, cell 2, Icon prop
			expect(hintedEl.childAt(0).prop('type')).toBe('sun');
			// row 1, cell 3, className
			expect(cells.at(2).prop('className')).toBe(styles.bdr);
			hintedEl = cells.at(2).childAt(0);
			// row 1, cell 3, useTooltip arg 1
			expect(hintedEl.prop('useTooltip_prop_1').type.displayName).toBe('SharedZoneTooltip');
			// row 1, cell 3, useTooltip arg 1, attr
			expect(hintedEl.prop('useTooltip_prop_1').props.zone).toBe('test_slab_1');
			// row 1, cell 3, useTooltip arg 2
			expect(hintedEl.prop('useTooltip_prop_2')).toBe('hint');
			// row 1, cell 3, ProgressBar
			expect(hintedEl.childAt(0).name()).toBe('ProgressBar');
			// row 1, cell 3, ProgressBar prop
			expect(hintedEl.childAt(0).prop('percentage')).toBe(30);

			// row 1, cell 4, text
			expect(cells.at(3).find(HumanReadableBytes).props().value).toBe(items[0][1].max_size);
			// row 1, cell 5, text
			expect(cells.at(4).find(HumanReadableBytes).props().value).toBe(items[0][1].size);
			// row 1, cell 6, className
			expect(cells.at(5).prop('className')).toBe(styles.bdr);
			// row 1, cell 6, ProgressBar
			expect(cells.at(5).childAt(0).name()).toBe('ProgressBar');
			// row 1, cell 6, ProgressBar warning
			expect(cells.at(5).childAt(0).prop('warning')).toBe(false);
			// row 1, cell 6, ProgressBar danger
			expect(cells.at(5).childAt(0).prop('danger')).toBe(false);
			// row 1, cell 6, ProgressBar percentage
			expect(cells.at(5).childAt(0).prop('percentage')).toBe(100);
			// row 1, cell 7, className
			expect(cells.at(6).prop('className')).toBe(styles['right-align']);
			// row 1, cell 7, text
			expect(cells.at(6).find(HumanReadableBytes).props().value).toBe(items[0][1].traffic.s_served);
			// row 1, cell 8, className
			expect(cells.at(7).prop('className')).toBe(styles['right-align']);
			// row 1, cell 8, text
			expect(cells.at(7).find(HumanReadableBytes).props().value).toBe(items[0][1].traffic.s_written);
			// row 1, cell 9, className
			expect(cells.at(8).prop('className')).toBe(`${styles.bdr} ${styles['right-align']}`);
			// row 1, cell 9, text
			expect(cells.at(8).find(HumanReadableBytes).props().value).toBe(items[0][1].traffic.s_bypassed);
			// row 1, cell 10, GaugeIndicator
			expect(cells.at(9).childAt(0).name()).toBe('GaugeIndicator');
			// row 1, cell 10, GaugeIndicator prop
			expect(cells.at(9).childAt(0).prop('percentage')).toBe(10);

			cells = rows.at(1).find('td');

			// row 2, cell 1, className
			expect(cells.at(0).prop('className')).toBe(`${styles.bold} ${styles.bdr}`);
			// row 2, cell 1, text
			expect(cells.at(0).text()).toBe('test_2');
			// row 2, cell 2, className
			expect(cells.at(1).prop('className')).toBe(`${styles.bdr} ${styles['center-align']}`);
			hintedEl = cells.at(1).find('span');
			// row 2, cell 2, useTooltip arg 1
			expect(hintedEl.prop('useTooltip_prop_1')).toBe('Cold');
			// row 2, cell 2, useTooltip arg 2
			expect(hintedEl.prop('useTooltip_prop_2')).toBe('hint');
			// row 2, cell 2, Icon
			expect(hintedEl.childAt(0).name()).toBe('Icon');
			// row 2, cell 2, Icon prop
			expect(hintedEl.childAt(0).prop('type')).toBe('snowflake');
			// row 2, cell 3, className
			expect(cells.at(2).prop('className')).toBe(styles.bdr);
			hintedEl = cells.at(2).childAt(0);
			// row 2, cell 3, useTooltip arg 1
			expect(hintedEl.prop('useTooltip_prop_1').type.displayName).toBe('SharedZoneTooltip');
			// row 2, cell 3, useTooltip arg 1, attr
			expect(hintedEl.prop('useTooltip_prop_1').props.zone).toBe('test_slab_2');
			// row 2, cell 3, useTooltip arg 2
			expect(hintedEl.prop('useTooltip_prop_2')).toBe('hint');
			// row 2, cell 3, ProgressBar
			expect(hintedEl.childAt(0).name()).toBe('ProgressBar');
			// row 2, cell 3, ProgressBar prop
			expect(hintedEl.childAt(0).prop('percentage')).toBe(0);
			// row 2, cell 4, className
			expect(cells.at(3).prop('className')).toBe(styles.bdr);
			// row 2, cell 4, text
			expect(cells.at(3).text()).toBe('∞');
			// row 2, cell 5, className
			expect(cells.at(4).prop('className')).toBe(styles.bdr);
			// row 2, cell 5, text
			expect(cells.at(4).find(HumanReadableBytes).props().value).toBe(items[1][1].size);
			// row 2, cell 6, className
			expect(cells.at(5).prop('className')).toBe(styles.bdr);
			// row 2, cell 6, span
			expect(cells.at(5).childAt(0).name()).toBe('span');
			// row 2, cell 7, className
			expect(cells.at(6).prop('className')).toBe(styles['right-align']);
			// row 2, cell 7, text
			expect(cells.at(6).find(HumanReadableBytes).props().value).toBe(items[1][1].traffic.s_served);
			// row 2, cell 8, className
			expect(cells.at(7).prop('className')).toBe(styles['right-align']);
			// row 2, cell 8, text
			expect(cells.at(7).find(HumanReadableBytes).props().value).toBe(items[1][1].traffic.s_written);
			// row 2, cell 9, className
			expect(cells.at(8).prop('className')).toBe(`${styles.bdr} ${styles['right-align']}`);
			// row 2, cell 9, text
			expect(cells.at(8).find(HumanReadableBytes).props().value).toBe(items[1][1].traffic.s_bypassed);
			// row 2, cell 10, GaugeIndicator
			expect(cells.at(9).childAt(0).name()).toBe('GaugeIndicator');
			// row 2, cell 10, GaugeIndicator prop
			expect(cells.at(9).childAt(0).prop('percentage')).toBe(11);

			tooltips.useTooltip.mockRestore();
			wrapper.unmount();
		});

		it('caches rows with shards', () => {
			jest.spyOn(tooltips, 'useTooltip').mockClear().mockImplementation((prop_1, prop_2) => ({
				useTooltip_prop_1: prop_1,
				useTooltip_prop_2: prop_2
			}));

			const items = [
				['test_1', {
					cold: false,
					slab: 'test_slab_1',
					zoneSize: 30,
					shards: {
						'/var/cache/angie/proxy_cache/test_slab_1_1': {
							size: 1064960,
							max_size: 16777216,
							warning: false,
							danger: false,
							cold: false
						},
						'/var/cache/angie/proxy_cache/test_slab_1_2': {
							size: 28672,
							max_size: 16777216,
							warning: false,
							danger: false,
							cold: false
						}
					},
					traffic: {
						s_served: 3,
						s_written: 2,
						s_bypassed: 1
					},
					hit_percents_generic: 10
				}], ['test_2', {
					cold: true,
					slab: 'test_slab_2',
					zoneSize: undefined,
					shards: {
						'/var/cache/angie/proxy_cache/test_slab_2_1': {
							size: 1024960,
							max_size: 16777216,
							warning: true,
							danger: true,
							used: 100,
							cold: false
						},
						'/var/cache/angie/proxy_cache/test_slab_2_2': {
							size: 38672,
							max_size: 16777216,
							warning: true,
							danger: true,
							used: 101,
							cold: true
						}
					},
					traffic: {
						s_served: 4,
						s_written: 3,
						s_bypassed: 2
					},
					hit_percents_generic: 11
				}]
			];

			const wrapper = shallow(
				<Caches data={{
					caches: new Map(items)
				}}
				/>
			);
			let expandableAllControl = wrapper.find('table thead tr').at(0).find('th').at(0);
			expect(expandableAllControl.prop('className')).toBe(`${styles.sorter} ${styles.sorterActive} ${styles['hovered-expander']}`);
			// all expandable control, icon
			expect(expandableAllControl.text()).toBe('▴');
			// all expandable control, rowSpan
			expect(expandableAllControl.prop('rowSpan')).toBe(2);
			// all expandable control, type
			expect(expandableAllControl.type()).toBe('th');
			expect(expandableAllControl.prop('useTooltip_prop_1')).toBe('Show all exists shards');
			expect(expandableAllControl.prop('useTooltip_prop_2')).toBe('hint-right');

			let rows = wrapper.find('[data-expandable="true"]');
			// count expandable elements
			expect(rows.length).toBe(2);

			let expandableElement = wrapper.find('[data-expandable-element]');
			expect(expandableElement.length).toBe(2);
			// row 1, cell 1
			expect(rows.at(0).childAt(0).prop('className')).toBe(styles['expanding-item-control']);
			// row 1, cell 1
			expect(rows.at(0).childAt(0).text()).toBe('▴');

			expect(rows.at(1).childAt(0).prop('className')).toBe(styles['expanding-item-control']);
			expect(rows.at(1).childAt(0).text()).toBe('▴');

			expandableAllControl = wrapper.find('table thead tr').at(0).find('th').at(0);
			// open all expandable elements
			expect(expandableAllControl.text()).toBe('▴');

			rows = wrapper.find('[data-expandable="true"]');
			// count expandable elements
			expect(rows.length).toBe(2);

			expandableElement = wrapper.find('[data-expandable-element]');
			// all expandable tables is show
			expect(expandableElement.length).toBe(2);

			// row 1, cell 1
			expect(rows.at(0).childAt(0).text()).toBe('▴');
			// row 2, cell 1
			expect(rows.at(1).childAt(0).text()).toBe('▴');

			rows.at(0).simulate('click');

			expandableAllControl = wrapper.find('table thead tr').at(0).find('th').at(0);
			// all expandable control is closed
			expect(expandableAllControl.text()).toBe('▾');

			rows = wrapper.find('[data-expandable="true"]');

			// row 1, cell 1
			expect(rows.at(0).childAt(0).text()).toBe('▾');
			// row 2, cell 1
			expect(rows.at(1).childAt(0).text()).toBe('▴');

			expandableElement = wrapper.find('[data-expandable-element]');
			// only one expandable element
			expect(expandableElement.length).toBe(1);
			const expandableElementCells = expandableElement.at(0).find('tbody tr');

			const row1 = expandableElementCells.at(0).find('td');
			const hintElementRow1 = row1.at(1).childAt(0);
			// row 1, cell 1
			expect(row1.at(0).text()).toBe('/var/cache/angie/proxy_cache/test_slab_2_1');
			// row 1, cell 2, Icon
			expect(hintElementRow1.name()).toBe('span');
			// row 1, cell 2, useTooltip arg 1
			expect(hintElementRow1.prop('useTooltip_prop_1')).toBe('Warm');
			// row 1, cell 2, useTooltip arg 2
			expect(hintElementRow1.prop('useTooltip_prop_2')).toBe('hint');
			// row 1, cell 3
			expect(row1.at(2).find(HumanReadableBytes).props().value).toBe(items[1][1].shards['/var/cache/angie/proxy_cache/test_slab_2_1'].max_size);
			// row 1, cell 4
			expect(row1.at(3).find(HumanReadableBytes).props().value).toBe(items[1][1].shards['/var/cache/angie/proxy_cache/test_slab_2_1'].size);
			// row 1, cell 5, ProgressBar
			expect(row1.at(4).childAt(0).name()).toBe('ProgressBar');
			// row 1, cell 5, ProgressBar warning
			expect(row1.at(4).childAt(0).prop('warning')).toBe(true);
			// row 1, cell 5, ProgressBar danger
			expect(row1.at(4).childAt(0).prop('danger')).toBe(true);
			// row 1, cell 5, ProgressBar percentage
			expect(row1.at(4).childAt(0).prop('percentage')).toBe(100);

			const row2 = expandableElementCells.at(1).find('td');
			const hintElementRow2 = row2.at(1).childAt(0);
			// row 2, cell 1
			expect(row2.at(0).text()).toBe('/var/cache/angie/proxy_cache/test_slab_2_2');
			// row 2, cell 2, Icon
			expect(hintElementRow2.name()).toBe('span');
			// row 2, cell 2, useTooltip arg 1
			expect(hintElementRow2.prop('useTooltip_prop_1')).toBe('{Cold}');
			// row 2, cell 2, useTooltip arg 2
			expect(hintElementRow2.prop('useTooltip_prop_2')).toBe('hint');
			// row 2, cell 3
			expect(row2.at(2).find(HumanReadableBytes).props().value).toBe(items[1][1].shards['/var/cache/angie/proxy_cache/test_slab_2_2'].max_size);
			// row 2, cell 4
			expect(row2.at(3).find(HumanReadableBytes).props().value).toBe(items[1][1].shards['/var/cache/angie/proxy_cache/test_slab_2_2'].size);
			// row 2, cell 5, ProgressBar
			expect(row2.at(4).childAt(0).name()).toBe('ProgressBar');
			// row 2, cell 5, ProgressBar warning
			expect(row2.at(4).childAt(0).prop('warning')).toBe(true);
			// row 2, cell 5, ProgressBar danger
			expect(row2.at(4).childAt(0).prop('danger')).toBe(true);
			// row 2, cell 5, ProgressBar percentage
			expect(row2.at(4).childAt(0).prop('percentage')).toBe(101);

			expandableAllControl.simulate('click');
			expandableAllControl = wrapper.find('table thead tr').at(0).find('th').at(0);
			// all expandable control, icon
			expect(expandableAllControl.text()).toBe('▾');

			expandableElement = wrapper.find('[data-expandable-element]');
			expect(expandableElement.length).toBe(0);

			rows = wrapper.find('[data-expandable="true"]');
			// row 1, cell 1
			expect(rows.at(0).childAt(0).text()).toBe('▾');
			// row 2, cell 1
			expect(rows.at(1).childAt(0).text()).toBe('▾');

			tooltips.useTooltip.mockRestore();
			wrapper.unmount();
		});
	});
});
