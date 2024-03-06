import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import type { ThemeCreate } from '@/stores/boards'
import { ThemeCreateSchema } from '@/stores/boards'

export function useCreateThemeForm({
  initialValues,
}: {
  initialValues: Partial<ThemeCreate>
}){
  const form = useForm<ThemeCreate>({
    initialValues,
    validationSchema: toTypedSchema(ThemeCreateSchema),
    validateOnMount: false,
  })

  const [title] = form.defineField('title')
  const [image] = form.defineField('image')
  const [thumbnail] = form.defineField('thumbnail')

  const values = {
    title,
    image,
    thumbnail,
  }

  return {
    ...form,
    values,
  }
}