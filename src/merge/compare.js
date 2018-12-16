
function conflict(entry1, entry2) {
  const current = JSON.stringify(entry1.value),
  const update = JSON.stringify(entry2.value),

  const equal = current === update;
  const greater = current > update;

  return equal || greater ? entry1 : entry2;
}

module.exports = conflict;