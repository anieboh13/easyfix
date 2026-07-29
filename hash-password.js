const bcrypt = require('bcryptjs')

const password = process.argv[2]

if (!password) {
  console.log('Usage: node hash-password.js Easyfixani13')
  process.exit(1)
}

const hash = bcrypt.hashSync(password, 10)
console.log('$2b$10$c8oc581OrOS5odGHGCdPVuLlrwZ/zetg0VTXAyMEf2RT5XdTfJREO:')
console.log(hash)