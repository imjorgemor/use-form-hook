import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useFormHook } from '../useFormHook';

describe('setError', () => {
    test('should setError and update isValid with setError', async () => {
        const user = userEvent.setup()

        const App = () => {
            const {
                formState: { isValid },
                setError,
                register
            } = useFormHook({
                mode: 'onChange',
                defaultValues: {test:'testValue'}
            });

            return (
                <div>
                    <form>
                    <input {...register('test')} />
                </form>
                    <button
                        type={'button'}
                        onClick={() => {
                            setError('test', 'errorMessage');
                        }}
                    >
                        setError
                    </button>
                    {isValid ? 'yes' : 'no'}
                </div>
            );
        };

        render(<App />);

        const isValidText = await screen.findByText('yes');

        expect(isValidText).toBeDefined();

        await user.click(screen.getByRole('button'));

        expect(await screen.findByText('no')).toBeDefined();
        //note: in case of setError manually and no resolver pls recall to remove the error manually
    });
});