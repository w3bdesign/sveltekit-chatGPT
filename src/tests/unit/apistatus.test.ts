import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';

import ApiStatus from '$components/ApiStatus.svelte';

describe('ApiStatus', () => {
	it('should show Connecting to API initially', () => {
		const { getByText } = render(ApiStatus);
		expect(getByText('Connecting to API')).toBeTruthy();
	});
});
