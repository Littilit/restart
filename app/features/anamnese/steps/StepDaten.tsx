'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Phone, Calendar, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAnamnese } from '../store';

const schema = z.object({
  vorname: z.string().min(2, 'Mindestens 2 Zeichen'),
  nachname: z.string().min(2, 'Mindestens 2 Zeichen'),
  email: z.string().email('Gültige E-Mail-Adresse erforderlich'),
  telefon: z.string().min(6, 'Mindestens 6 Zeichen'),
  geburtsdatum: z.string().refine((val) => {
    const d = new Date(val);
    if (isNaN(d.getTime())) return false;
    const now = new Date();
    const min = new Date(now.getFullYear() - 100, now.getMonth(), now.getDate());
    return d <= now && d >= min;
  }, 'Bitte ein gültiges Geburtsdatum angeben (max. 100 Jahre zurück)'),
  adresse: z.string().min(3, 'Mindestens 3 Zeichen'),
});

type FormData = z.infer<typeof schema>;

export function StepDaten() {
  const { data, updateContact, next, back } = useAnamnese();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      vorname: data.vorname,
      nachname: data.nachname,
      email: data.email,
      telefon: data.telefon,
      geburtsdatum: data.geburtsdatum,
      adresse: data.adresse,
    },
  });

  function onSubmit(values: FormData) {
    updateContact(values);
    next();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Vorname"
          leftIcon={<User className="h-4 w-4" />}
          error={errors.vorname?.message}
          {...register('vorname')}
        />
        <Input
          label="Nachname"
          error={errors.nachname?.message}
          {...register('nachname')}
        />
      </div>
      <Input
        label="E-Mail"
        type="email"
        leftIcon={<Mail className="h-4 w-4" />}
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Telefon"
        type="tel"
        leftIcon={<Phone className="h-4 w-4" />}
        error={errors.telefon?.message}
        {...register('telefon')}
      />
      <Input
        label="Geburtsdatum"
        type="date"
        leftIcon={<Calendar className="h-4 w-4" />}
        error={errors.geburtsdatum?.message}
        max={new Date().toISOString().substring(0, 10)}
        min={new Date(new Date().getFullYear() - 100, new Date().getMonth(), new Date().getDate()).toISOString().substring(0, 10)}
        {...register('geburtsdatum')}
      />
      <Input
        label="Adresse"
        placeholder="Straße, PLZ, Stadt"
        leftIcon={<MapPin className="h-4 w-4" />}
        error={errors.adresse?.message}
        {...register('adresse')}
      />

      <div className="pt-2 flex gap-3">
        <Button type="button" variant="ghost" onClick={back} className="flex-1">
          Zurück
        </Button>
        <Button type="submit" className="flex-[2]">
          Weiter
        </Button>
      </div>
    </form>
  );
}
