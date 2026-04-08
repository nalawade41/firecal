const ABBREVIATIONS = [
  'sbi', 'hdfc', 'icici', 'uti', 'lic', 'idfc', 'dsp', 'tata', 'l&t',
  'navi', 'stcg', 'ltcg', 'etf', 'gold', 'ppfas', 'elss', 'fof', 'sip', 'swp', 'stp',
]

export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => {
      if (ABBREVIATIONS.includes(word)) {
        return word.toUpperCase()
      }
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}
