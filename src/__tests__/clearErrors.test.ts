import { act, renderHook } from '@testing-library/react';

import { useFormHook } from '../useFormHook';

describe('clearErrors', () => {
    test('should remove a single error', () => {
        const { result } = renderHook(() => useFormHook<{ input: string }>());
        act(() => {
            result.current.register('input');
            result.current.setError('input', 'message');

        });

        act(() => result.current.clearErrors('input'));

        expect(result.current.formState.errors).toEqual({});
    });

    test('should remove all error', () => {
        const { result } = renderHook(() =>
            useFormHook<{ input: string; input1: string; input2: string }>(),
        );

        result.current.formState.errors;

        const error = 'message';

        act(() => result.current.setError('input', error));
        act(() => result.current.setError('input1', error));
        act(() => result.current.setError('input2', error));
        expect(result.current.formState.errors).toEqual({
            input: error,
            input1: error,
            input2: error
        });

        act(() => result.current.clearErrors());
        expect(result.current.formState.errors).toEqual({});
    });

    test('should remove a list of errors', () => {
        const { result } = renderHook(() =>
            useFormHook<{ input: string; input1: string; input2: string }>(),
        );

        result.current.formState.errors;

        const error = 'message';

        act(() => result.current.setError('input', error));
        act(() => result.current.setError('input1', error));
        act(() => result.current.setError('input2', error));
        expect(result.current.formState.errors).toEqual({
            input: error,
            input1: error,
            input2: error
        });

        act(() => result.current.clearErrors(['input', 'input1']));
        expect(result.current.formState.errors).toEqual({ input2: error });
    });
});
