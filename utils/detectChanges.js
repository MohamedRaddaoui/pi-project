function detectChanges(oldTask, newTask) {
  const changes = {};
  for (const key in newTask) {
    if (
      newTask[key] !== undefined &&
      JSON.stringify(oldTask[key]) !== JSON.stringify(newTask[key]) &&
      key !== "__v" && key !== "updatedAt"
    ) {
      changes[key] = {
        from: oldTask[key],
        to: newTask[key],
      };
    }
  }
  return changes;
}

module.exports = detectChanges;