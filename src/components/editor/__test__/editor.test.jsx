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
import Editor from '../editor';

describe('Editor', () => {
	it('render()', () => {
		const wrapper = shallow(<Editor />);
		expect(wrapper.hasClass('Editor')).toBeTrue();
	});
});
