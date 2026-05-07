// TODO: replace mock returns with Supabase calls when integrating
import { initialGroups } from '@/data/mockGroups'
import type { Group } from '@/types/group'

export async function listGroups(): Promise<Group[]> {
  return initialGroups
}

export async function createGroup(_name: string, _memberEmails: string[]): Promise<Group> {
  // TODO: supabase.from('groups').insert(...)
  throw new Error('Not implemented')
}

export async function deleteGroup(_id: string): Promise<void> {
  // TODO: supabase.from('groups').delete().eq('id', id)
}
