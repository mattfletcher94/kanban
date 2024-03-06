import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import type { ColumnCreate } from '@/stores/boards'
import { ColumnCreateSchema } from '@/stores/boards'

export function useCreateColumnForm({
  initialValues,
}: {
  initialValues: Partial<ColumnCreate>
}){
  const form = useForm<ColumnCreate>({
    initialValues,
    validationSchema: toTypedSchema(ColumnCreateSchema),
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