import { createRoot } from 'react-dom/client'
import './index.css'
import { TestForm } from './FormWithValidation'
//import {App} from '../paper/app'

createRoot(document.getElementById('root')!).render(
    <TestForm />
)
