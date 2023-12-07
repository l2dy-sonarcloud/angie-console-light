/*
*
 * Copyright 2023-present, Web Server LLC
 * Copyright 2017-present, Nginx, Inc.
 * Copyright 2017-present, Ivan Poluyanov
 * Copyright 2017-present, Igor Meleshchenko
 * All rights reserved.
 *
 */
if (!!(window.Proxy && window.Promise && window.Worker)) {
	require('./index.jsx').start();
} else {
	require('./unsupported.jsx').start();
}
