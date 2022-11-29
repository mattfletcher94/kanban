import moment from 'moment'
import type { Board, Card, Column } from '../stores/boards'

export const boards: Board[] = [
  {
    id: '1',
    title: 'My Board',
    themeId: '1',
    dateCreated: moment().format(),
    dateUpdated: moment().format(),
  },
]

export const columns: Column[] = [
  {
    id: '1',
    boardId: '1',
    title: 'Backlog',
    order: 0,
    dateCreated: moment().format(),
    dateUpdated: moment().format(),
  },
  {
    id: '2',
    boardId: '1',
    title: 'To do',
    order: 1,
    dateCreated: moment().format(),
    dateUpdated: moment().format(),
  },
  {
    id: '3',
    boardId: '1',
    title: 'In progress',
    order: 2,
    dateCreated: moment().format(),
    dateUpdated: moment().format(),
  },
  {
    id: '4',
    boardId: '1',
    title: 'Done',
    order: 3,
    dateCreated: moment().format(),
    dateUpdated: moment().format(),
  },
]

export const cards: Card[] = [
  {
    id: '1',
    columnId: '1',
    labelIds: ['3', '4'],
    title: 'My first card',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    links: [],
    todos: undefined,
    order: 1,
    dateCreated: moment().format(),
    dateUpdated: moment().format(),
  },
]
