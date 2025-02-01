import { useFormHook } from "../src/useFormHook"

const resolver = {
    username: (value: string) => {
        if (value === '' || value === undefined || value === null) {
            return 'name is required';
        }
        return false;
    },
    email: (value: string) => {
        if (value === '' || value === undefined || value === null) {
            return 'email is required';
        }
        return false;
    },
    // age: (value: string) => {
    //     if (value === '' || value === undefined || value === null) {
    //         return 'age is required';
    //     }
    //     return false;
    // },
    conditions: (value: boolean) => {
        if (value === false || value === undefined || value === null) {
            return 'you must accept conditions';
        }
        return false;
    },
    attachement: (value: FileList) => {
        if (!value || value?.length === 0) {
            return 'You must attach a file';
        }
        return false;
    },
    metadata: (value: string) => {
        if (value === '' || value === undefined || value === null) {
            return 'metadata is required';
        }
        return false;
    }
};


function App() {
    const { register, formState, ...rest } = useFormHook({
        mode: 'all',
        defaultValues: { username: undefined, email: undefined, conditions: false, attachement: undefined },
        resolver
    })
    const { errors } = formState;

    return (
        <main>
            <section className="px-4 py-4 max-w-[80%]">
                <form className="flex flex-col gap-2">
                    <div>
                        <input
                            {...register('username')}
                            type="text"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        />
                        {errors.username && <p>{errors.username}</p>}
                    </div>
                    <div>
                        <input
                            {...register('email')}
                            type="email"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        />
                        {errors.email && <p>{errors.email}</p>}
                    </div>

                    <div>
                        <label htmlFor="conditions" className="flex items-center gap-2">
                            <input
                                {...register('conditions')}
                                type="checkbox"
                                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                            />
                            <p className="flex-1">conditions</p>

                        </label>

                        {errors.conditions && <p>{errors.conditions}</p>}
                    </div>
                    <div>
                        <input
                            {...register('attachement')}
                            type="file"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        />
                        {errors.attachement && <p>{errors.attachement}</p>}
                    </div>
                    <div>
                        <input type='submit' className="border-2 rounded-md py-2 px-8" />
                    </div>

                </form>
                <div>
                    isValid:{JSON.stringify(formState.isValid)}
                </div>
                <div>
                    <button className="border-2 rounded-md py-2 px-8" type="button" onClick={() => console.log('Current Values:', rest.getValues())}>log current values</button>
                </div>
                <div>
                        <button className="border-2 rounded-md py-2 px-8" type="button" onClick={() => rest.reset()}>reset form with valid values</button>
                    </div>
                <div>
                    <button className="border-2 rounded-md py-2 px-8" type="button" onClick={() => rest.setError('username', 'name is required')}>set error</button>
                </div>
                <div>
                    <button className="border-2 rounded-md py-2 px-8" type="button" onClick={() => rest.trigger()}>trigger errors</button>
                </div>
            </section>
        </main>
    )
}

export default App
