import instance3 from './base3.js'

export default (event, state = {}) => {
  console.log('query ->', { event, state })
  return instance3.post('/query', { event, ...state })
}