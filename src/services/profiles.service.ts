import { supabase } from '@/services/supabase'
import type { AvatarKey } from '@/lib/avatars'

export async function getProfileSettings(): Promise<{ isPublic: boolean; avatarKey: string | null; error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { isPublic: true, avatarKey: null, error: 'No hay sesion activa' }

  const { data, error } = await supabase
    .from('users')
    .select('is_public_profile, avatar_key')
    .eq('id', user.id)
    .single()

  if (error) return { isPublic: true, avatarKey: null, error: error.message }
  return {
    isPublic: (data as { is_public_profile: boolean }).is_public_profile ?? true,
    avatarKey: (data as { avatar_key: string | null }).avatar_key ?? null,
    error: null,
  }
}

export async function updatePublicProfileSetting(isPublic: boolean): Promise<{ error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No hay sesion activa' }

  const { error } = await supabase
    .from('users')
    .upsert({ id: user.id, is_public_profile: isPublic }, { onConflict: 'id' })

  return { error: error?.message ?? null }
}

export async function updateAvatarKey(avatarKey: AvatarKey): Promise<{ error: string | null }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No hay sesion activa' }

  const { error } = await supabase
    .from('users')
    .upsert({ id: user.id, avatar_key: avatarKey }, { onConflict: 'id' })

  return { error: error?.message ?? null }
}
