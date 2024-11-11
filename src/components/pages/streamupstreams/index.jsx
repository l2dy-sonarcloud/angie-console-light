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
import api, { apiStreamUpstreams, streamUpstreamsApi } from '../../../api';
import calculateSharedZones from '../../../calculators/sharedzones.js';
import UpstreamsContainer from '../../upstreams/upstreamscontainer.jsx';
import StreamUpstream from './streamupstream.jsx';
import DataBinder from '../../databinder/databinder.jsx';

export class StreamUpstreams extends React.Component {
	render() {
		const { data: { upstreams } } = this.props;

		return (
			<UpstreamsContainer
				title="TCP/UDP-апстримы"
				component={StreamUpstream}
				upstreams={upstreams}
				upstreamsApi={streamUpstreamsApi}
				isStream
			/>
		);
	}
}

export default DataBinder(StreamUpstreams, [
	api.slabs.process(calculateSharedZones),
	apiStreamUpstreams
]);
