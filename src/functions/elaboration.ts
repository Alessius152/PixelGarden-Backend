
function uuidToBuffer(uuid: string) {
  return Buffer.from(uuid.replace(/-/g, ''), 'hex')
}

function bufferToUuid(buffer: Buffer): string {
  const hex = buffer.toString('hex')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}

function normalizeDateToItalian(date: Date) {
  return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export {
  uuidToBuffer,
  bufferToUuid,
  normalizeDateToItalian,
}
