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
import styles from './style.css';

export const defaultSN = styles.loader;
export const graySN = styles['gray-loader'];

export default function Loader({ gray, className }){
    let cn = className || '';

    cn += `${ cn ? ' ' : '' }${ gray ? graySN : defaultSN }`;

	return (
		<div className={ cn } />
	);
};