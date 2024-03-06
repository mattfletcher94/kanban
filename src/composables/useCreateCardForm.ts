import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import type { CardCreate } from '@/stores/boards'
import { CardCreateSchema } from '@/stores/boards'

export function useCreateCardForm({
  initialValues,
}: {
  initialValues: Partial<CardCreate>
}){
  const form = useForm<CardCreate>({
    initialValues,
    validationSchema: toTypedSchema(CardCreateSchema),
    validateOnMount: false,
  })

  const [title] = form.defineField('title')

  const values = {
    title,
  }

  return {
    ...form,
    values,
  }
}