import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useFormHook } from '../useFormHook';

describe('getFieldState', () => {
    test('should display error state', async () => {
        const user = userEvent.setup()
        const App = () => {
            const {
                trigger,
                register,
                getFieldState,
                formState: { errors },
            } = useFormHook({
                defaultValues: {
                    test: '',
                },
                resolver: { test: (value) => value ? false : 'This is required' },
            });

            errors;

            return (
                <form>
                    <input {...register('test')} />
                    <button type={'button'} onClick={() => trigger()}>
                        trigger
                    </button>
                    <p>{getFieldState('test')?.error}</p>
                </form>
            );
        };

        render(<App />);

        user.click(screen.getByRole('button'));

        expect(await screen.findByText('This is required')).toBeDefined();
    });
})