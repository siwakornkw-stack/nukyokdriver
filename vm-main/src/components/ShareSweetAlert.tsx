import { useShareContext } from '@/contexts/share-context';
import React from 'react';
import SweetAlert from './SweetAlert';

export default function ShareSweetAlert() {
	const { swalRef } = useShareContext();

	return (
		<SweetAlert ref={swalRef} />
	)
}
