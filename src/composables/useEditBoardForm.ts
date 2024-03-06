import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import type { BoardUpdate } from '@/stores/boards'
import { BoardUpdateShema } from '@/stores/boards'

export function useEditBoardForm({
  initialValues,
}: {
  initialValues: Partial<BoardUpdate>
}){
  const form = useForm<BoardUpdate>({
    initialValues,
    validationSchema: toTypedSchema(BoardUpdateShema),
    validateOnMount: false,
  })

  const [title] = form.defineField('title')
  const [themeId] = form.defineField('themeId')
  const [description] = form.defineField('description')
  const [viewSettings] = form.defineField('viewSettings')

  const values = {
    title,
    themeId,
    description,
    viewSettings,
  }

  return {
    ...form,
    values,
  }
}