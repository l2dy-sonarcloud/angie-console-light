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

import styles from './tooltip.css';
import utils from '#/utils.js';

export default function ConnectionsTooltip({ title = 'Последний', peer }) {
	return (
		<div>
			{
				peer.selected ? (
					<div>
						<div>
							{title}
							:
							{utils.formatDate(peer.selected)}
						</div>
						<div>
							(
							{utils.formatUptime(new Date().getTime() - Date.parse(peer.selected))}
							{' '}
							назад)
						</div>
					</div>
				)
					: `${title}: неизвестный`
			}
		</div>
	);
}
