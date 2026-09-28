// Lightweight unique-enough id generator — avoids pulling in a uuid
// dependency for what is, per record, a single local insert.
export default function makeId(prefix = "id") {
  const time = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${time}${rand}`;
}
