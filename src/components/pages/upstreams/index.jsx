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
import api, { httpUpstreamsApi } from '../../../api';
import calculateUpstreams from '../../../calculators/upstreams.js';
import calculateSharedZones from '../../../calculators/sharedzones.js';
import UpstreamsContainer from '../../upstreams/upstreamscontainer.jsx';
import Upstream from './upstream.jsx';
import DataBinder from '../../databinder/databinder.jsx';

export class Upstreams extends React.Component {
	render() {
		const { data: { upstreams } } = this.props;

		return (
			<UpstreamsContainer
				title="HTTP-апстримы"
				component={Upstream}
				upstreams={upstreams}
				upstreamsApi={httpUpstreamsApi}
				isStream={false}
			/>
		);
	}
}

export default DataBinder(Upstreams, [
	api.slabs.process(calculateSharedZones),
	api.http.upstreams.process(calculateUpstreams)
]);
