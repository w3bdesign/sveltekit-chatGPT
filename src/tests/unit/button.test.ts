import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';

import Button from '$components/Button.svelte';

describe('Button', () => {
	it('Should render without crashing', () => {
		const { getByRole } = render(Button, { props: { buttonType: 'filled', buttonWidth: '8rem' } });
		expect(document.body.contains(getByRole('button'))).toBe(true);
	});

	it('Should be disabled when isDisabled is true', () => {
		render(Button, { props: { isDisabled: true } });
		const button = document.querySelector('button') as HTMLButtonElement;
		expect(button.disabled).toBe(true);
	});

	it('Should be enabled when isDisabled is false', () => {
		render(Button, { props: { isDisabled: false } });
		const button = document.querySelector('button') as HTMLButtonElement;
		expect(button.disabled).toBe(false);
	});
});
