import React from 'react';
import { act, render, renderHook } from '@testing-library/react';

import { useFormHook } from '../useFormHook';

describe('reset', () => {
    it('should reset form value', () => {
        let methods: any;
        const App = () => {
            methods = useFormHook<{
                test: string;
            }>();
            return (
                <form>
                    <input {...methods.register('test')} />
                </form>
            );
        };
        render(<App />);

        act(() =>
            methods.reset({ test: 'test' })
        );

        expect(methods.getValues()).toEqual({ test: 'test' });
    });

    test('should set default value if values is specified to first argument', async () => {
        const { result } = renderHook(() =>
            useFormHook<{
                test: string;
            }>(),
        );

        result.current.register('test');

        act(() => result.current.reset({ test: 'test' }));

        expect(result.current.getValues()).toEqual({
            test: 'test',
        });
        
        expect(result.current.formState.isValid).toBeTruthy();;
    });
})