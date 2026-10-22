import { describe,expect,it } from 'vitest';
import { render,screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FiltersPanel } from './FiltersPanel';
import type {Filters} from '../types';
const filters:Filters={q:'',genre:'',sort:'relevance',availableOnly:false};
describe('Фильтры',()=>{
 it('передаёт введённый поиск',async()=>{let value='';render(<FiltersPanel filters={filters} onChange={next=>{value=next.q;}} onReset={()=>{}}/>);await userEvent.type(screen.getByRole('searchbox',{name:/название или автор/i}),'Б');expect(value).toBe('Б');});
 it('передаёт сброс',async()=>{let count=0;render(<FiltersPanel filters={filters} onChange={()=>{}} onReset={()=>{count++;}}/>);await userEvent.click(screen.getByRole('button',{name:/сбросить/i}));expect(count).toBe(1);});
});
