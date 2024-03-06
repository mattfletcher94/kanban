import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import type { CardUpdate } from '@/stores/boards'
import { CardUpdateSchema } from '@/stores/boards'

export function useEditCardForm({
  initialValues,
}: {
  initialValues: Partial<CardUpdate>
}){
  const form = useForm<CardUpdate>({
    initialValues,
    validationSchema: toTypedSchema(CardUpdateSchema),
    validateOnMount: false,
  })

  const [labelIds] = form.defineField('labelIds')
  const [title] = form.defineField('title')
  const [description] = form.defineField('description')
  const [links] = form.defineField('links')
  const [todos] = form.defineField('todos')
  const [order] = form.defineField('order')

  const values = {
    title,
    labelIds,
    description,
    links,
    todos,
    order,
  }

  return {
    ...form,
    values,
  }
}