import React from 'react';
import { act, renderHook, screen, render } from '@testing-library/react';

import { useFormHook } from '../useFormHook';

describe('register', () => {
    test('should support register passed to ref', async () => {
        const { result } = renderHook(() =>
            useFormHook<{ test: string }>({
                defaultValues: {
                    test: 'testData',
                },
            }),
        );

        result.current.register('test');

        await act(async () => {
            await result.current.handleSubmit((data) => {
                expect(data).toEqual({
                    test: 'testData',
                });
            })({
                preventDefault: () => { },
                persist: () => { },
            } as React.SyntheticEvent);
        });
    });

    test.each([['text'], ['radio'], ['checkbox']])(
        'should register field for %s type and remain its value after unmount',
        async (type) => {
            const Component = () => {
                const {
                    register,
                    watch,
                    formState: { isDirty },
                } = useFormHook<{
                    test: string;
                }>({
                    defaultValues: {
                        test: 'test',
                    },
                });

                const test = watch('test');

                return (
                    <form>
                        <input type={type} {...register('test')} />
                        <span role="alert">{`${isDirty}`}</span>
                        {test}
                    </form>
                );
            };

            render(<Component />);

            const ref = screen.getByRole(type === 'text' ? 'textbox' : type);

            ref.remove();

            expect(screen.getByRole('alert').textContent).toBe('false');

            expect(screen.getByText('test')).toBeDefined();
        },
    );

    test('should be set default value when item is remounted again', async () => {
        const { result, unmount } = renderHook(() => useFormHook<{ test: string }>());

        result.current.register('test');

        result.current.setValue('test', 'test');

        unmount();

        const ref = { type: 'text', name: 'test' };

        result.current.register('test');

        expect(ref).toEqual({ type: 'text', name: 'test' });

        expect(result.current.getValues()).toEqual({ test: 'test' });
    });
});
