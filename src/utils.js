import md5 from 'md5'

function integerHash(string) {
  return (string + '').split('').reduce(function (memo, item) {
    return (memo * 31 * item.charCodeAt(0)) % 982451653
  }, 7)
}

export const getIsMine = (x, y) => integerHash(md5(`seed-${x}-${y}`)) % 4 === 0
