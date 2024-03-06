import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import type { BoardCreate } from '@/stores/boards'
import { BoardCreateSchema } from '@/stores/boards'

export function useCreateBoardForm({
  initialValues,
}: {
  initialValues: Partial<BoardCreate>
}){
  const form = useForm<BoardCreate>({
    initialValues,
    validationSchema: toTypedSchema(BoardCreateSchema),
    validateOnMount: false,
  })

  const [title] = form.defineField('title')
  const [themeId] = form.defineField('themeId')

  const values = {
    title,
    themeId,
  }

  return {
    ...form,
    values,
  }
}