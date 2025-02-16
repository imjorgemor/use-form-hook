import { useForm } from './useForm'


const App = () => {
    const { register, handleSubmit, formState:{errors}} = useForm({
        defaultValues: { username: '', email: '', },
        resolver: {
            username: (value: string) => !value ? 'name is required' : false,
            email: (value: string) => !value ? 'email is required' : false,
        }
    })

    const onSubmit = (values:any) => {
        console.log('submited values:', values);
    };

    return (
        <main>
            <section className="px-4 py-4 max-w-[80%]">
                <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
                    <div>
                        <label>Username</label>
                        <input
                            {...register('username')}
                            type="text"
                            className='border-2 rounded-md ml-2'
                        />
                        {errors.username && <p className='text-red-400'>{errors.username}</p>}
                    </div>
                    <div>
                        <label>email</label>
                        <input
                            {...register('email')}
                            type="email"
                            className='border-2 rounded-md ml-2'
                        />
                        {errors.email && <p className='text-red-400'>{errors.email}</p>}
                    </div>
                    <div>
                        <input type='submit' className="cursor-pointer text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 w-30" />
                    </div>
                </form>
            </section>
        </main>
    )
}

export { App };
