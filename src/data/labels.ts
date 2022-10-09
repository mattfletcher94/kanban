import moment from 'moment'
import type { Label } from '../stores/boards'

export const labels: Label[] = [
  {
    id: '1',
    title: 'Low Priority',
    color: 'green',
    dateCreated: moment().format(),
    dateUpdated: moment().format(),
  },
  {
    id: '2',
    title: 'Medium Priority',
    color: 'amber',
    dateCreated: moment().format(),
    dateUpdated: moment().format(),
  },
  {
    id: '3',
    title: 'High Priority',
    color: 'red',
    dateCreated: moment().format(),
    dateUpdated: moment().format(),
  },
]
