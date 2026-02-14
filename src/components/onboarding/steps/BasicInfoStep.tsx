'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { basicInfoStepSchema, type BasicInfoStepInput } from '@/lib/validations/profile'
import { PRONOUNS, REGIONS } from '@/lib/constants'
import type { CreateProfileInput } from '@/lib/validations/profile'

interface BasicInfoStepProps {
  data: Partial<CreateProfileInput>
  updateData: (data: Partial<CreateProfileInput>) => void
  onNext: () => void
}

export function BasicInfoStep({ data, updateData, onNext }: BasicInfoStepProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<BasicInfoStepInput>({
    resolver: zodResolver(basicInfoStepSchema),
    defaultValues: {
      display_name: data.display_name || '',
      date_of_birth: data.date_of_birth,
      pronouns: data.pronouns || undefined,
      region: data.region || undefined,
    },
  })

  const onSubmit = (values: BasicInfoStepInput) => {
    updateData(values)
    onNext()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="display_name">Display Name</Label>
        <Input
          id="display_name"
          placeholder="GamerTag123"
          {...register('display_name')}
        />
        <p className="text-xs text-muted-foreground">
          Letters, numbers, and underscores only. This is how other users will see you.
        </p>
        {errors.display_name && (
          <p className="text-xs text-destructive">{errors.display_name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="date_of_birth">Date of Birth</Label>
        <Controller
          control={control}
          name="date_of_birth"
          render={({ field }) => (
            <Input
              type="date"
              id="date_of_birth"
              max={format(
                new Date(new Date().setFullYear(new Date().getFullYear() - 18)),
                'yyyy-MM-dd'
              )}
              onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
              value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
            />
          )}
        />
        {errors.date_of_birth && (
          <p className="text-xs text-destructive">{errors.date_of_birth.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="pronouns">Pronouns (optional)</Label>
        <Controller
          control={control}
          name="pronouns"
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <SelectTrigger>
                <SelectValue placeholder="Select pronouns" />
              </SelectTrigger>
              <SelectContent>
                {PRONOUNS.map((pronoun) => (
                  <SelectItem key={pronoun} value={pronoun}>
                    {pronoun}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="region">Region</Label>
        <Controller
          control={control}
          name="region"
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <SelectTrigger>
                <SelectValue placeholder="Select your region" />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <p className="text-xs text-muted-foreground">
          This helps match you with players in similar time zones.
        </p>
        {errors.region && <p className="text-xs text-destructive">{errors.region.message}</p>}
      </div>

      <Button type="submit" className="w-full">
        Continue
      </Button>
    </form>
  )
}
