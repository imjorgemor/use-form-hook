import { useFormHook } from "../src/useFormHook"


function App() {
    const { register, ...rest } = useFormHook({ defaultValues: { test: 'testValue' } })
    console.log({rest})

    return (
        <main>
            <section className="px-4 py-4">
                <form>
                    <div>
                        <input type="text" {...register('test')} />
                    </div>
                    <div>
                        <input type='submit' />
                    </div>
                    {JSON.stringify(rest.formState.isValid)}
                </form>
            </section>
        </main>
    )
}

export default App
