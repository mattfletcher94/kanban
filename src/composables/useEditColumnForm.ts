import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import type { ColumnUpdate } from '@/stores/boards'
import { ColumnUpdateSchema } from '@/stores/boards'

export function useEditColumnForm({
  initialValues,
}: {
  initialValues: Partial<ColumnUpdate>
}){
  const form = useForm<ColumnUpdate>({
    initialValues,
    validationSchema: toTypedSchema(ColumnUpdateSchema),
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