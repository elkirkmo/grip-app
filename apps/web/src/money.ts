import { config } from './config'

export const money = new Intl.NumberFormat(undefined, { style: 'currency', currency: config.currency })
