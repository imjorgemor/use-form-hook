import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useFormHook } from '../useFormHook';

describe('resetField', () => {
    test('should reset input value', async() => {
        const user = userEvent.setup()
        const App = () => {
            const { register, resetField } = useFormHook({
                defaultValues: {
                    test: '',
                },
            });

            return (
                <form>
                    <input {...register('test')} />
                    <button
                        type={'button'}
                        onClick={() => {
                            resetField('test');
                        }}
                    >
                        reset
                    </button>
                </form>
            );
        };


        render(<App />);

        await user.type(screen.getByRole('textbox'), '1234')

        expect((screen.getByRole('textbox') as HTMLInputElement).value).toEqual(
            '1234',
        );

        await user.click(screen.getByRole('button'));

        expect((screen.getByRole('textbox') as HTMLInputElement).value).toEqual(
            '',
        );
    });
});
