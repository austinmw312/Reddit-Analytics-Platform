import { DEFAULT_SUBREDDITS } from './default-subreddits'

const LOCAL_SUBREDDITS_KEY = 'local-subreddits'

interface LocalSubreddit {
  name: string;
  addedAt: number; // timestamp
}

export function getLocalSubreddits(): string[] {
  if (typeof window === 'undefined') return []
  
  const stored = localStorage.getItem(LOCAL_SUBREDDITS_KEY)
  if (!stored) {
    // Initialize with default subreddits from the imported constant
    const baseTime = Date.now()
    const defaults: LocalSubreddit[] = DEFAULT_SUBREDDITS.map((name, index) => ({
      name,
      addedAt: baseTime + (index * 1000)
    }))
    localStorage.setItem(LOCAL_SUBREDDITS_KEY, JSON.stringify(defaults))
    return defaults.map(s => s.name)
  }
  
  try {
    const subreddits: LocalSubreddit[] = JSON.parse(stored)
    
    // Handle the case where the stored data is in the old format (just array of strings)
    if (Array.isArray(subreddits) && typeof subreddits[0] === 'string') {
      const baseTime = Date.now()
      const oldFormat = subreddits as unknown as string[]
      const updatedSubreddits: LocalSubreddit[] = oldFormat.map((name, index) => ({
        name,
        addedAt: baseTime + (index * 1000)
      }))
      localStorage.setItem(LOCAL_SUBREDDITS_KEY, JSON.stringify(updatedSubreddits))
      return updatedSubreddits.map(s => s.name)
    }
    
    // Sort by addedAt in ascending order (oldest first)
    return subreddits
      .sort((a, b) => a.addedAt - b.addedAt)
      .map(s => s.name)
  } catch (error) {
    // If there's any error parsing, reset to defaults
    console.error('Error parsing stored subreddits:', error)
    localStorage.removeItem(LOCAL_SUBREDDITS_KEY)
    return getLocalSubreddits()
  }
}

export function addLocalSubreddit(name: string): void {
  if (typeof window === 'undefined') return
  
  const stored = localStorage.getItem(LOCAL_SUBREDDITS_KEY)
  const subreddits: LocalSubreddit[] = stored ? JSON.parse(stored) : []
  
  if (!subreddits.some(s => s.name === name)) {
    subreddits.push({
      name,
      addedAt: Date.now()
    })
    localStorage.setItem(LOCAL_SUBREDDITS_KEY, JSON.stringify(subreddits))
  }
}

export function removeLocalSubreddit(name: string): void {
  if (typeof window === 'undefined') return
  
  const stored = localStorage.getItem(LOCAL_SUBREDDITS_KEY)
  if (!stored) return
  
  const subreddits: LocalSubreddit[] = JSON.parse(stored)
  const filtered = subreddits.filter(s => s.name !== name)
  localStorage.setItem(LOCAL_SUBREDDITS_KEY, JSON.stringify(filtered))
} 