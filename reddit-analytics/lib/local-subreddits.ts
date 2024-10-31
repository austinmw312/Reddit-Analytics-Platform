const LOCAL_SUBREDDITS_KEY = 'local-subreddits'

interface LocalSubreddit {
  name: string;
  addedAt: number; // timestamp
}

export function getLocalSubreddits(): string[] {
  if (typeof window === 'undefined') return []
  
  const stored = localStorage.getItem(LOCAL_SUBREDDITS_KEY)
  if (!stored) {
    // Initialize with default subreddits, each added 1 second after the previous
    // This ensures they maintain a consistent order
    const baseTime = Date.now()
    const defaults: LocalSubreddit[] = [
      'cscareerquestions', 
      'openai', 
      'startups', 
      'machinelearning', 
      'webdev'
    ].map((name, index) => ({
      name,
      addedAt: baseTime - ((4 - index) * 1000) // Earlier items will appear later in the list
    }))
    localStorage.setItem(LOCAL_SUBREDDITS_KEY, JSON.stringify(defaults))
    return defaults.map(s => s.name)
  }
  
  try {
    const subreddits: LocalSubreddit[] = JSON.parse(stored)
    
    // Handle the case where the stored data is in the old format (just array of strings)
    if (Array.isArray(subreddits) && typeof subreddits[0] === 'string') {
      const baseTime = Date.now()
      const updatedSubreddits: LocalSubreddit[] = subreddits.map((name, index) => ({
        name,
        addedAt: baseTime - ((subreddits.length - 1 - index) * 1000)
      }))
      localStorage.setItem(LOCAL_SUBREDDITS_KEY, JSON.stringify(updatedSubreddits))
      return updatedSubreddits.map(s => s.name)
    }
    
    // Sort by addedAt in descending order (most recent first)
    return subreddits
      .sort((a, b) => b.addedAt - a.addedAt)
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