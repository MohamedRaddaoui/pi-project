let Filter;

async function loadFilter() {
  if (!Filter) {
    const module = await import('bad-words');
    Filter = module.Filter || module.default; // 🛠️ selon ce que le module exporte
  }

  const filterInstance = new Filter();
  filterInstance.addWords("con", "connard", "salope", "merde", "pute", "enculé", "tafiole");

  return filterInstance;
}

async function checkComment(text) {
  const filter = await loadFilter();
  return {
    isFlagged: filter.isProfane(text),
  };
}

module.exports = { checkComment };
