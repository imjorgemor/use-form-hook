import { renderHook, act } from "@testing-library/react";

import { useFormHook } from "../useFormHook";

describe('watch', () => {
    test('should watch individual input', async () => {
        const { result } = renderHook(() => {
            return useFormHook<{ test: string }>({
                defaultValues: {
                    test: 'data',
                },
            });
        });

        expect(result.current.watch('test')).toBe('data');

        result.current.register('test');

        await act(async () => {
            result.current.setValue('test', 'data1');
        });

        act(() => {
            expect(result.current.watch('test')).toBe('data1');
        });
    });
})