import React from 'react';
import { act, renderHook } from "@testing-library/react";

import { useFormHook } from "../useFormHook";

describe('setValue', () => {
    test('should not setValue for unmounted state with shouldUnregister', () => {
        const { result } = renderHook(() => useFormHook<{ test1: string }>());

        result.current.register('test1');
        result.current.setValue('test1', 'data');
    });

    test('should empty string when value is null or undefined when registered field is HTMLElement', () => {
        let methods: any;
        const { result } = renderHook(() =>
            methods = useFormHook<{ test?: string | null }>({
                defaultValues: {
                    test: 'test',
                },
            }),
        );

        const elm = document.createElement('input');
        elm.type = 'text';
        elm.name = 'test';

        result.current.register('test');

        result.current.setValue('test', null);

        act(() => {
            const values = methods.getValues()
            expect(values).toMatchObject({ test: null })
        });
    });

    test('should set value of radio input correctly', async () => {
        const { result } = renderHook(() => useFormHook<{ test: string }>());

        result.current.register('test');

        result.current.setValue('test', '1');

        await act(async () => {
            await result.current.handleSubmit((data) => {
                expect(data).toEqual({
                    test: '1',
                });
            })({
                preventDefault: () => { },
                persist: () => { },
            } as React.SyntheticEvent);
        });
    });

    test('should set value of file input correctly if value is FileList', async () => {
        const { result } = renderHook(() => useFormHook<{ test: FileList }>());

        result.current.register('test');

        const file = new File([''], '', { type: 'image/png', lastModified: 1 });
        const fileList = {
            0: file,
            1: file,
            length: 2,
        } as unknown as FileList;

        act(() => result.current.setValue('test', fileList));

        await act(async () => {
            await result.current.handleSubmit((data) => {
                expect(data).toEqual({
                    test: fileList,
                });
            })({
                preventDefault: () => { },
                persist: () => { },
            } as React.SyntheticEvent);
        });
    });

    test('should set value of single checkbox input correctly', async () => {
        const { result } = renderHook(() => useFormHook<{ test: string }>());

        result.current.register('test');

        result.current.setValue('test', '1');

        await act(async () => {
            await result.current.handleSubmit((data) => {
                expect(data).toEqual({
                    test: '1',
                });
            })({
                preventDefault: () => { },
                persist: () => { },
            } as React.SyntheticEvent);
        });
    });

    test('should set value of multiple select correctly', async () => {
        const { result } = renderHook(() => useFormHook<{ test: string[] }>());
        result.current.register('test');

        result.current.setValue('test', ['1']);

        await act(async () => {
            await result.current.handleSubmit((data) => {
                expect(data).toEqual({
                    test: ['1'],
                });
            })({
                preventDefault: ()=>{},
                persist: ()=>{},
            } as React.SyntheticEvent);
        });
    });

});