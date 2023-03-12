import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { v4 as uuidv4 } from 'uuid'
import moment from 'moment'
import { themes } from '../data/themes'
import { labels as defaultLabels } from '../data/labels'
import { boards as defaultBoards, cards as defaultCards, columns as defaultColumns } from '../data/boards'

export interface Card {
  id: string
  columnId: string
  labelIds: string[]
  title: string
  description?: string
  links?: Array<{ id: string; name: string; url: string }>
  todos?: Array<{ id: string; description: string; completed: boolean }>
  order: number
  dateCreated: string
  dateUpdated: string
}

export interface Column {
  id: string
  boardId: string
  title: string
  order: number
  dateCreated: string
  dateUpdated: string
}

export interface Board {
  id: string
  themeId: string
  title: string
  description?: string
  dateCreated: string
  dateUpdated: string
}

export interface Theme {
  id: string
  title: string
  image: string
  thumbnail: string
  isCustom?: boolean
  dateCreated?: string
  dateUpdated?: string
}

export interface Label {
  id: string
  title: string
  color: string
  dateCreated: string
  dateUpdated: string
}

export type BoardCreate = Omit<Board, 'id' | 'dateCreated' | 'dateUpdated'>

export type BoardUpdate = Partial<Omit<Board, 'id' | 'dateCreated' | 'dateUpdated'>> & Pick<Board, 'id'>

export type ColumnCreate = Omit<Column, 'id' | 'dateCreated' | 'dateUpdated'>

export type ColumnUpdate = Partial<Omit<Column, 'id' | 'dateCreated' | 'dateUpdated'>> & Pick<Column, 'id' | 'boardId'>

export type CardCreate = Omit<Card, 'id' | 'dateCreated' | 'dateUpdated'>

export type CardUpdate = Partial<Omit<Card, 'id' | 'dateCreated' | 'dateUpdated'>> & Pick<Card, 'id' | 'columnId'>

export type LabelCreate = Omit<Label, 'id' | 'dateCreated' | 'dateUpdated'>

export type LabelUpdate = Partial<Omit<Label, 'id' | 'dateCreated' | 'dateUpdated'>> & Pick<Label, 'id'>

export type ThemeCreate = Omit<Theme, 'id' | 'isCustom'>

export type ThemeUpdate = Partial<Omit<Theme, 'id'>> & Pick<Theme, 'id' | 'isCustom'>

export const useBoardsStore = defineStore({
  id: 'boards',
  state: () => ({
    boards: useStorage<Board[]>('boards', defaultBoards),
    columns: useStorage<Column[]>('columns', defaultColumns),
    cards: useStorage<Card[]>('cards', defaultCards),
    themes: useStorage<Theme[]>('themes', themes),
    labels: useStorage<Label[]>('labels', defaultLabels),
    selectedBoardId: useStorage<string>('selectedBoardId', ''),
  }),
  getters: {
    getBoards: state => state.boards,
    getBoardById: state => (id: string) => state.boards.find(board => board.id === id),
    getBoardColumns: state => (boardId: string) => state.columns.filter(column => column.boardId === boardId),
    getBoardCards: state => (boardId: string) => state.cards.filter(card => state.columns.find(column => column.boardId === boardId && column.id === card.columnId)),
    getColumnCards: state => (columnId: string) => state.cards.filter(card => card.columnId === columnId).sort((a, b) => a.order - b.order),
    getColumnById: state => (id: string) => state.columns.find(column => column.id === id),
    getCardById: state => (id: string) => state.cards.find(card => card.id === id),
    getCardLabels: state => (cardId: string) => {
      const card = state.cards.find(card => card.id === cardId)
      if (!card)
        return []
      const labels = state.labels.filter(label => card.labelIds.includes(label.id))
      return labels
    },
    getLabels: state => state.labels,
    getLabelById: state => (id: string) => state.labels.find(label => label.id === id),
    getThemes: state => state.themes,
    getThemeById: state => (id: string) => state.themes.find(theme => theme.id === id),
  },
  actions: {
    createBoard(board: BoardCreate) {
      const newBoard = {
        id: uuidv4(),
        dateCreated: moment().format(),
        dateUpdated: moment().format(),
        ...board,
      }
      this.boards.push(newBoard)
      return newBoard
    },
    updateBoard(board: BoardUpdate) {
      const index = this.boards.findIndex(({ id }) => id === board.id)
      const updatedBoard: Board = {
        ...this.boards[index],
        ...board,
        dateUpdated: moment().format(),
      }
      this.boards[index] = updatedBoard
      return updatedBoard
    },
    deleteBoard(boardId: string) {
      // Find all columns belonging to the board
      const columns = this.columns.filter(({ id }) => boardId === id)

      // Find all cards belonging to the board
      const cards = this.cards.filter(({ columnId }) => columns.some(({ id }) => id === columnId))

      // Remove cards
      this.cards = this.cards.filter(({ id }) => !cards.some(({ id: cardId }) => id === cardId))

      // Remove columns
      this.columns = this.columns.filter(({ id }) => !columns.some(({ id: columnId }) => id === columnId))

      // Remove board
      this.boards = this.boards.filter(({ id }) => id !== boardId)
    },

    createColumn(column: ColumnCreate) {
      const entity = {
        id: uuidv4(),
        dateCreated: moment().format(),
        dateUpdated: moment().format(),
        ...column,
      }
      this.columns.push(entity)
      return entity
    },
    updateColumn(column: ColumnUpdate) {
      const index = this.columns.findIndex(({ id }) => id === column.id)
      this.columns[index] = {
        ...this.columns[index],
        ...column,
        dateUpdated: moment().format(),
      }
    },
    updateColumnOrders(orders: { id: string; order: number }[]) {
      orders.forEach(({ id, order }) => {
        const index = this.columns.findIndex(column => column.id === id)
        this.columns[index].order = order
      })
    },
    deleteColumn(columnId: string) {
      // Find all cards belonging to the column
      const cards = this.cards.filter(({ id }) => columnId === id)

      // Remove cards
      this.cards = this.cards.filter(({ id }) => !cards.some(({ id: cardId }) => id === cardId))

      // Remove column
      this.columns = this.columns.filter(({ id }) => id !== columnId)
    },

    createCard(card: CardCreate) {
      const entity = {
        id: uuidv4(),
        dateCreated: moment().format(),
        dateUpdated: moment().format(),
        ...card,
      }
      this.cards.push(entity)
      return entity
    },
    updateCard(card: CardUpdate) {
      const index = this.cards.findIndex(({ id }) => id === card.id)
      card.title = card.title?.trim()
      card.description = card.description?.trim()

      this.cards[index] = {
        ...this.cards[index],
        ...card,
        dateUpdated: moment().format(),
      }
    },
    deleteCard(cardId: string) {
      this.cards = this.cards.filter(({ id }) => id !== cardId)
    },

    createLabel(label: LabelCreate) {
      const entity = {
        id: uuidv4(),
        dateCreated: moment().format(),
        dateUpdated: moment().format(),
        ...label,
      }
      this.labels.push(entity)
      return entity
    },
    updateLabel(label: LabelUpdate) {
      const index = this.labels.findIndex(({ id }) => id === label.id)
      this.labels[index] = {
        ...this.labels[index],
        ...label,
        dateUpdated: moment().format(),
      }
    },
    deleteLabel(labelId: string) {
      // Remove label from cards
      this.cards = this.cards.map(card => ({
        ...card,
        labelIds: card.labelIds?.filter(id => id !== labelId) ?? [],
      }))

      // Remove label
      this.labels = this.labels.filter(({ id }) => id !== labelId)
    },

    createTheme(theme: ThemeCreate) {
      const entity = {
        id: uuidv4(),
        isCustom: true,
        dateCreated: moment().format(),
        dateUpdated: moment().format(),
        ...theme,
      }
      this.themes.push(entity)
      return entity
    },
    updateTheme(theme: ThemeUpdate) {
      const themeFound = this.themes.find(({ id }) => id === theme.id)

      // Dont allow updating default themes
      if (themeFound && !themeFound.isCustom)
        return

      const index = this.themes.findIndex(({ id }) => id === theme.id)
      this.themes[index] = {
        ...this.themes[index],
        ...theme,
        dateUpdated: moment().format(),
      }
    },
    deleteTheme(themeId: string) {
      const theme = this.themes.find(({ id }) => id === themeId)

      // Dont allow deleting default themes
      if (theme && !theme.isCustom)
        return

      // Remove theme from boards
      this.boards = this.boards.map(board => ({
        ...board,
        themeId: board.themeId === themeId ? this.themes[0].id : board.themeId,
      }))

      // Remove theme
      this.themes = this.themes.filter(({ id }) => id !== themeId)
    },

  },
})
